import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json([
    { id: 'P-101', name: 'Main Cooling Pump', status: 'Healthy', risk: 'Low', lastMaintenance: '2026-05-12', nextMaintenance: '2026-11-12' },
    { id: 'C-204', name: 'Primary Gas Compressor', status: 'Warning', risk: 'Medium', lastMaintenance: '2025-12-01', nextMaintenance: '2026-06-01' },
    { id: 'B-12', name: 'High Pressure Boiler', status: 'Critical', risk: 'High', lastMaintenance: '2025-08-15', nextMaintenance: 'Past Due' },
  ]);
});

export default router;
