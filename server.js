import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const app = express();
app.use(cors());
app.use(express.json());

// servir frontend (public/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function jsonError(res, status, msg, details) {
  return res.status(status).json({ erro: msg, details });
}

/**
 * REGISTROS
 */

// GET todos
app.get("/api/registros", async (req, res) => {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("id", { ascending: false });

  if (error) return jsonError(res, 500, "Erro ao listar registros", error);
  res.json(data);
});

// GET pendentes (vencidas)
app.get("/api/pendentes", async (req, res) => {
  // “pendentes” = proxima_manutencao < hoje
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .lt("proxima_manutencao", hoje)
    .order("proxima_manutencao", { ascending: true });

  if (error) return jsonError(res, 500, "Erro ao listar pendentes", error);
  res.json(data);
});

// POST criar
app.post("/api/registros", async (req, res) => {
  const { cliente, modelo, oleo, contato, data_manutencao, dias } = req.body;

  if (!cliente || !modelo || !oleo || !contato || !data_manutencao || dias == null) {
    return jsonError(res, 400, "Campos obrigatórios faltando");
  }

  const proxima = new Date(data_manutencao);
  proxima.setDate(proxima.getDate() + Number(dias));
  const proximaISO = proxima.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("registros")
    .insert([{
      cliente,
      modelo,
      oleo,
      contato,
      data_manutencao,
      dias: Number(dias),
      proxima_manutencao: proximaISO
    }])
    .select();

  if (error) return jsonError(res, 500, "Erro ao criar registro", error);
  res.status(201).json(data[0]);
});

// PUT “fazer manutenção” (recalcula datas)
app.put("/api/registros/:id", async (req, res) => {
  const { id } = req.params;

  // buscar o registro atual (pra pegar dias)
  const { data: atual, error: errGet } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .single();

  if (errGet) return jsonError(res, 404, "Registro não encontrado", errGet);

  const hoje = new Date();
  const hojeISO = hoje.toISOString().slice(0, 10);

  const proxima = new Date(hojeISO);
  proxima.setDate(proxima.getDate() + Number(atual.dias));
  const proximaISO = proxima.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("registros")
    .update({
      data_manutencao: hojeISO,
      proxima_manutencao: proximaISO
    })
    .eq("id", id)
    .select();

  if (error) return jsonError(res, 500, "Erro ao atualizar registro", error);
  res.json(data[0]);
});

// DELETE
app.delete("/api/registros/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("registros")
    .delete()
    .eq("id", id);

  if (error) return jsonError(res, 500, "Erro ao deletar registro", error);
  res.json({ success: true });
});

/**
 * GARANTIAS
 * Frontend espera:
 * g.dataVencimento, g.dataServico, g.mesesGarantia, g.descricaoServico, g.telefone
 * Vamos guardar no banco em snake_case e RESPONDER em camelCase (pra não mexer no front).
 */

function garantiaToFront(g) {
  if (!g) return g;
  return {
    id: g.id,
    cliente: g.cliente,
    servico: g.servico,
    descricaoServico: g.descricao_servico ?? null,
    valor: Number(g.valor ?? 0),
    dataServico: g.data_servico,
    mesesGarantia: g.meses_garantia,
    telefone: g.telefone ?? null,
    dataVencimento: g.data_vencimento
  };
}

app.get("/api/garantias", async (req, res) => {
  const { data, error } = await supabase
    .from("garantias")
    .select("*")
    .order("id", { ascending: false });

  if (error) return jsonError(res, 500, "Erro ao listar garantias", error);
  res.json(data.map(garantiaToFront));
});

app.post("/api/garantias", async (req, res) => {
  const {
    cliente,
    servico,
    descricaoServico,
    valor,
    dataServico,
    mesesGarantia,
    telefone
  } = req.body;

  if (!cliente || !servico || !valor || !dataServico || !mesesGarantia) {
    return jsonError(res, 400, "Campos obrigatórios faltando");
  }

  const venc = new Date(dataServico);
  venc.setMonth(venc.getMonth() + Number(mesesGarantia));
  const vencISO = venc.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("garantias")
    .insert([{
      cliente,
      servico,
      descricao_servico: descricaoServico ?? null,
      valor: Number(valor),
      data_servico: dataServico,
      meses_garantia: Number(mesesGarantia),
      telefone: telefone ?? null,
      data_vencimento: vencISO
    }])
    .select();

  if (error) return jsonError(res, 500, "Erro ao criar garantia", error);
  res.status(201).json(garantiaToFront(data[0]));
});

app.delete("/api/garantias/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("garantias")
    .delete()
    .eq("id", id);

  if (error) return jsonError(res, 500, "Erro ao deletar garantia", error);
  res.json({ success: true });
});

// PDF simples
app.get("/api/garantias/:id/pdf", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("garantias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return jsonError(res, 404, "Garantia não encontrada", error);

  const g = garantiaToFront(data);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="Garantia_${id}.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text("Box Motors - Garantia", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Cliente: ${g.cliente}`);
  doc.text(`Serviço: ${g.servico}`);
  doc.text(`Descrição: ${g.descricaoServico || "—"}`);
  doc.text(`Valor: R$ ${Number(g.valor).toFixed(2)}`);
  doc.text(`Data do Serviço: ${g.dataServico}`);
  doc.text(`Duração: ${g.mesesGarantia} mês(es)`);
  doc.text(`Vencimento: ${g.dataVencimento}`);
  doc.text(`Telefone: ${g.telefone || "—"}`);

  doc.moveDown();
  doc.fontSize(10).text("Emitido automaticamente pelo sistema Box Motors.", { align: "center" });

  doc.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));