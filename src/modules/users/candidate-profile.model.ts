import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class CandidateProfile extends Model<InferAttributes<CandidateProfile>, InferCreationAttributes<CandidateProfile>> {
  declare id: CreationOptional<number>; declare userId: number; declare phone: string | null; declare location: string | null; declare bio: string | null; declare skills: string | null; declare experience: string | null; declare education: string | null; declare resumeUrl: string | null;
}
CandidateProfile.init({ id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true }, userId: { type: DataTypes.INTEGER.UNSIGNED, unique: true, allowNull: false }, phone: DataTypes.STRING(30), location: DataTypes.STRING(150), bio: DataTypes.TEXT, skills: DataTypes.TEXT, experience: DataTypes.TEXT, education: DataTypes.TEXT, resumeUrl: DataTypes.STRING(255) }, { sequelize, tableName: "candidate_profiles" });
