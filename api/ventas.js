/*
 * api/ventas.js
 * Función serverless de Vercel (ruta: /api/ventas).
 * Lee el CSV publicado de Google Sheets y lo entrega al panel.
 *
 * La URL de la hoja está definida abajo. Si en Vercel existe la variable de entorno
 * SHEET_CSV_URL, esa tiene prioridad y se puede cambiar sin tocar el código.
 */
const URL_HOJA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZhG16c6gNzf_76m8fnRuDOnFbYdnDDvr-9PnoEiQOVQLL30TvE44RYisrBVXTUeuZFXvD6Mtqt7ht/pub?output=csv";

module.exports = async function handler(req, res) {
  const url = process.env.SHEET_CSV_URL || URL_HOJA;

  try {
    const respuesta = await fetch(url, { cache: "no-store" });
    if (!respuesta.ok) {
      res.status(502).send("La hoja de cálculo respondió con el código " + respuesta.status + ".");
      return;
    }
    const csv = await respuesta.text();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    // Vercel guarda la respuesta 5 minutos: protege a Google de consultas repetidas
    // y mantiene los datos prácticamente al día.
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(csv);
  } catch (error) {
    res.status(502).send("No se pudo leer la hoja de cálculo.");
  }
};
