const GAS_URL = 'https://script.google.com/macros/s/AKfycbz8HlJXye6-NAi5Nv1r8ZwhiUXZ98tSiTG7N3HxrJTqpd7Le5aRPNm4PvkJfyBMwawW/exec';

export default async function handler(req: any, res: any) {
  try {
    const response = await fetch(`${GAS_URL}?action=getSeats`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Google Apps Script 통신 실패: ' + (error?.message || '알 수 없는 오류'),
    });
  }
}
