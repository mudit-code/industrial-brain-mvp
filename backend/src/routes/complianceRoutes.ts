import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, title: 'Fire Inspection Overdue', description: 'Zone B facility fire safety inspection was due 3 days ago.', severity: 'High', date: '2026-06-19' },
    { id: 2, title: 'Pressure Vessel Certificate Expires Soon', description: 'Vessel V-892 certificate expires in 9 days. Requires immediate attention.', severity: 'Medium', date: '2026-07-01' },
    { id: 3, title: 'Missing Maintenance Log', description: 'Log entry for Compressor C-204 routine check is missing from system.', severity: 'Low', date: '2026-06-21' },
  ]);
});

export default router;
