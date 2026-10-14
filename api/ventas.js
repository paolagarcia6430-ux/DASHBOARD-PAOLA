/*
 * api/ventas.js
 * Función serverless de Vercel (ruta: /api/ventas).
 * Lee el CSV publicado de Google Sheets y lo entrega al panel.
 * La URL de la hoja vive en la variable de entorno SHEET_CSV_URL (Vercel > Settings > Environment Variables),
 * por lo que no queda escrita en el código ni en el repositorio.
 */
module.exports = async function handler(req, res) {
  const url = process.env.SHEET_CSV_URL;

  if (!url) {
    res.status(500).send("Falta la variable de entorno SHEET_CSV_URL en Vercel.");
    return;
  }

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
