import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz8HlJXye6-NAi5Nv1r8ZwhiUXZ98tSiTG7N3HxrJTqpd7Le5aRPNm4PvkJfyBMwawW/exec';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Proxy: GET seats
  app.get('/api/seats', async (_req: Request, res: Response) => {
    try {
      const response = await fetch(`${GAS_URL}?action=getSeats`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('[API Error] getSeats failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Google Apps Script 통신 실패: ' + (error?.message || '알 수 없는 오류'),
      });
    }
  });

  // API Proxy: POST reserve
  app.post('/api/reserve', async (req: Request, res: Response) => {
    try {
      const payload = {
        action: 'reserveSeat',
        seatNo: req.body.seatNo,
        userName: req.body.userName,
        email: req.body.email,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
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
      res.json(data);
    } catch (error: any) {
      console.error('[API Error] reserveSeat failed:', error);
      res.status(500).json({
        status: 'error',
        message: '좌석 예약 요청 처리 실패: ' + (error?.message || '알 수 없는 오류'),
      });
    }
  });

  // API Proxy: POST cancel
  app.post('/api/cancel', async (req: Request, res: Response) => {
    try {
      const payload = {
        action: 'cancelReservation',
        seatNo: req.body.seatNo,
        reservationId: req.body.reservationId,
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
      res.json(data);
    } catch (error: any) {
      console.error('[API Error] cancelReservation failed:', error);
      res.status(500).json({
        status: 'error',
        message: '예약 취소 요청 처리 실패: ' + (error?.message || '알 수 없는 오류'),
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', gasUrl: GAS_URL });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(console.error);
