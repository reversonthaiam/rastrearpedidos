import microCors from "micro-cors";
import rastreio from "rastrearpedidos";

const CACHE_CONTROL_HEADER_VALUE =
  "max-age=0, s-maxage=86400, stale-while-revalidate, public";
const cors = microCors();

async function Rastreio(request, response) {
  const requestedCode = request.query.codigo;
  const clientIp =
    request.headers["x-forwarded-for"] || request.connection.remoteAddress;

  console.log({
    url: request.url,
    clientIp: clientIp,
  });

  response.setHeader("Cache-Control", CACHE_CONTROL_HEADER_VALUE);

  try {
    const rastreioResult = await rastreio(requestedCode);
    response.status(200);
    response.json(rastreioResult);
  } catch (error) {
    if (error.error) {
      switch (error.error) {
        case "validation_error":
          response.status(400);
          break;
        case "service_error":
          response.status(404);
          break;
        default:
          break;
      }

      response.json(error);
      return;
    }

    response.status(500);
    response.json(error);
  }
}

export default cors(Rastreio);
