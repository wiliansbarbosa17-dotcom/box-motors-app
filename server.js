import QRCode from "qrcode";
import 'dotenv/config';
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
import QRCode from "qrcode"; // <-- no topo do arquivo (junto com os imports)

app.get("/api/garantias/:id/pdf", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("garantias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ erro: "Garantia não encontrada", details: error });

  // adapte aqui se você já usa a função garantiaToFront
  const g = garantiaToFront ? garantiaToFront(data) : data;

  // Link para validação (você pode criar uma página depois; por enquanto é só URL)
  const validationUrl = `https://box-motors-app.onrender.com/?garantia=${id}`;

  // QR Code (DataURL)
  const qrDataUrl = await QRCode.toDataURL(validationUrl, { margin: 1, scale: 6 });
  const qrBase64 = qrDataUrl.split(",")[1];
  const qrBuffer = Buffer.from(qrBase64, "base64");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="Garantia_BoxMotors_${id}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(res);

  // ====== HEADER ======
  doc
    .fontSize(20)
    .text("BOX MOTORS", { align: "left" })
    .moveDown(0.2);

  doc
    .fontSize(11)
    .text("Serviços Especializados em Manutenção", { align: "left" })
    .text("WhatsApp: (69) 99314-4190  |  Instagram: @box_motors", { align: "left" })
    .moveDown(1);

  // Linha
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  // ====== TITULO ======
  doc
    .fontSize(16)
    .text("CERTIFICADO DE GARANTIA", { align: "center" })
    .moveDown(1);

  // ====== BLOCO PRINCIPAL ======
  const boxTop = doc.y;
  const boxLeft = 40;
  const boxWidth = 515;
  const boxHeight = 210;

  doc
    .roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
    .stroke();

  // Coluna esquerda (dados)
  const leftX = boxLeft + 15;
  let y = boxTop + 15;

  const money = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

  doc.fontSize(11).text(`Nº da Garantia: ${id}`, leftX, y); y += 18;
  doc.text(`Cliente: ${g.cliente || "-"}`, leftX, y); y += 18;
  doc.text(`Telefone: ${g.telefone || "—"}`, leftX, y); y += 18;

  doc.text(`Serviço: ${g.servico || "-"}`, leftX, y); y += 18;
  doc.text(`Descrição: ${g.descricaoServico || "—"}`, leftX, y); y += 18;

  doc.text(`Valor: ${money(g.valor)}`, leftX, y); y += 18;
  doc.text(`Data do Serviço: ${g.dataServico || "-"}`, leftX, y); y += 18;
  doc.text(`Duração: ${g.mesesGarantia || "-"} mês(es)`, leftX, y); y += 18;
  doc.text(`Vencimento: ${g.dataVencimento || "-"}`, leftX, y); y += 18;

  // Coluna direita (QR)
  const qrX = boxLeft + boxWidth - 140;
  const qrY = boxTop + 25;

  doc
    .fontSize(10)
    .text("Validar garantia", qrX, qrY - 15, { width: 120, align: "center" });

  doc.image(qrBuffer, qrX, qrY, { width: 120, height: 120 });

  doc
    .fontSize(8)
    .text("Escaneie para consultar", qrX, qrY + 125, { width: 120, align: "center" });

  doc.moveDown(1);
  doc.y = boxTop + boxHeight + 15;

  // ====== TERMOS ======
  doc.fontSize(12).text("Termos da garantia", { align: "left" }).moveDown(0.4);

  doc.fontSize(10).text(
`1) A garantia cobre exclusivamente o serviço descrito neste certificado.
2) Não cobre mau uso, quedas, adaptações, violação de lacres, ou peças não fornecidas/instaladas pela Box Motors.
3) É obrigatório apresentar este certificado (impresso ou digital) para acionamento.
4) O prazo conta a partir da data do serviço, até a data de vencimento informada.`,
    { align: "left" }
  );

  doc.moveDown(1);

  // ====== ASSINATURAS ======
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(1);

  const signY = doc.y;

  doc.fontSize(10).text("Assinatura do Cliente", 40, signY, { width: 240, align: "center" });
  doc.moveTo(40, signY + 30).lineTo(280, signY + 30).stroke();

  doc.fontSize(10).text("Assinatura Box Motors", 315, signY, { width: 240, align: "center" });
  doc.moveTo(315, signY + 30).lineTo(555, signY + 30).stroke();

  doc.moveDown(4);

  // ====== RODAPÉ ======
  doc
    .fontSize(8)
    .text(`Emitido automaticamente em ${new Date().toLocaleString("pt-BR")}`, { align: "center" })
    .text(`Validação: ${validationUrl}`, { align: "center" });

  doc.end();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
