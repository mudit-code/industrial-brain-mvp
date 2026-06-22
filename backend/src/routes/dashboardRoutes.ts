import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    documentsIndexed: 1248,
    activeAssets: 342,
    complianceAlerts: 3,
    aiQueriesToday: 156,
    recentActivity: [
      { user: 'System', action: 'Uploaded manual_pump_p101.pdf', time: '2 hours ago' },
      { user: 'System', action: 'Uploaded boiler_b12_specs.pdf', time: '5 hours ago' }
    ]
  });
});

export default router;
