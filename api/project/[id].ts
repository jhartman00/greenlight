import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM projects WHERE id = ${id}`;
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { name } = req.body;
    try {
      const { rows } = await sql`
        UPDATE projects SET name = ${name}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, created_at, updated_at
      `;
      return res.status(200).json(rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM projects WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
