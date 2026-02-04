
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  gradDate: string;
  gpa?: string;
  grades?: string;
}

export interface Project {
  id: string;
  title: string;
  link?: string;
  description: string;
  date: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
}

export type ResumeTemplateType = 'Standard' | 'Technology' | 'Business' | 'Creative';

export interface ResumeData {
  id?: string;
  template: ResumeTemplateType;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  references: Reference[];
  skills: string;
  languages: string;
  jobDescription?: string;
  submittedAt?: string;
  atsScore?: {
    score: number;
    feedback: string;
    missingKeywords: string[];
  };
}

export type FormSection = 'personal' | 'summary' | 'education' | 'experience' | 'projects' | 'certifications' | 'references' | 'skills' | 'ats';

export type AppMode = 'user' | 'admin';
