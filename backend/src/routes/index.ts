import { Router } from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import billingRoutes from './billingRoutes.js';
import medicalRecordRoutes from './medicalRecordRoutes.js';
import labTestRoutes from './labTestRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import queryRoutes from './queryRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/bills', billingRoutes);
apiRouter.use('/medical-records', medicalRecordRoutes);
apiRouter.use('/lab-tests', labTestRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/queries', queryRoutes);

export default apiRouter;
