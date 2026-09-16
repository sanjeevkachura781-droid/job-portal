import { User } from "../modules/auth/auth.model";
import { CandidateProfile } from "../modules/users/candidate-profile.model";
import { Company } from "../modules/companies/company.model";
import { Job } from "../modules/jobs/job.model";
import { Application } from "../modules/applications/application.model";
import { Interview } from "../modules/interviews/interview.model";
import { Notification } from "../modules/notifications/notification.model";

User.hasOne(CandidateProfile, { foreignKey: "userId", as: "candidateProfile" });
CandidateProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Company, { foreignKey: "recruiterId", as: "companies" });
Company.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });

Company.hasMany(Job, { foreignKey: "companyId", as: "jobs" });
Job.belongsTo(Company, { foreignKey: "companyId", as: "company" });
User.hasMany(Job, { foreignKey: "recruiterId", as: "jobs" });
Job.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });

Job.hasMany(Application, {
  foreignKey: "jobId",
  as: "applications",
});
Application.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job",
});
User.hasMany(Application, { foreignKey: "candidateId", as: "applications" });
Application.belongsTo(User, { foreignKey: "candidateId", as: "candidate" });

Application.hasMany(Interview, { foreignKey: "applicationId", as: "interviews" });
Interview.belongsTo(Application, { foreignKey: "applicationId", as: "application" });
User.hasMany(Interview, { foreignKey: "recruiterId", as: "scheduledInterviews" });
Interview.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });
User.hasMany(Interview, { foreignKey: "candidateId", as: "candidateInterviews" });
Interview.belongsTo(User, { foreignKey: "candidateId", as: "candidate" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
