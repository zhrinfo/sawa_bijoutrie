const deliveryAddressesUrl = 'http://localhost:8080/api/delivery-addresses'

export async function GET() {
  try {
    const response = await fetch(deliveryAddressesUrl, { cache: 'no-store' })

    if (!response.ok) {
      return Response.json(
        { message: 'Impossible de charger les villes de livraison.' },
        { status: response.status },
      )
    }

    return Response.json(await response.json())
  } catch {
    return Response.json(
      { message: 'Le serveur de livraison est indisponible.' },
      { status: 502 },
    )
  }
}
