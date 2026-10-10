const GAS_URL = 'https://script.google.com/macros/s/AKfycbz8HlJXye6-NAi5Nv1r8ZwhiUXZ98tSiTG7N3HxrJTqpd7Le5aRPNm4PvkJfyBMwawW/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'fail', message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const payload = {
      action: 'reserveSeat',
      seatNo: body.seatNo,
      userName: body.userName,
      email: body.email,
      startTime: body.startTime,
      endTime: body.endTime,
    };

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { status: 'success', raw: text };
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: '좌석 예약 요청 처리 실패: ' + (error?.message || '알 수 없는 오류'),
    });
  }
}
