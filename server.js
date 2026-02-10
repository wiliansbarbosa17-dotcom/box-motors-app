import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// TESTE
app.get("/", (req, res) => {
  res.send("API Box Motors + Supabase OK");
});

// GET todos
app.get("/api/registros", async (req, res) => {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});

// POST criar
app.post("/api/registros", async (req, res) => {
  const {
    cliente,
    modelo,
    oleo,
    contato,
    data_manutencao,
    dias
  } = req.body;

  const proxima = new Date(data_manutencao);
  proxima.setDate(proxima.getDate() + Number(dias));

  const { data, error } = await supabase
    .from("registros")
    .insert([{
      cliente,
      modelo,
      oleo,
      contato,
      data_manutencao,
      dias,
      proxima_manutencao: proxima
    }])
    .select();

  if (error) return res.status(500).json(error);
  res.status(201).json(data[0]);
});

// DELETE
app.delete("/api/registros/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("registros")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Servidor rodando na porta", PORT)
);
