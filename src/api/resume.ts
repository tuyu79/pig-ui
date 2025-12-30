import service from '/@/utils/request';

// 简历数据类型
export interface ResumeData {
  basic: {
    name: string;
    gender: string;
    age: number;
    phone: string;
    email: string;
    city: string;
    intention: string;
    salary: string;
    summary: string;
    avatar: string;
  };
  education: Array<{
    school: string;
    degree: string;
    major: string;
    dateRange: string[];
  }>;
  work: Array<{
    company: string;
    position: string;
    dateRange: string[];
    description: string;
  }>;
  project: Array<{
    name: string;
    role: string;
    dateRange: string[];
    tech: string;
    description: string;
    achievement: string;
  }>;
  skills: string[];
  otherSkills: string;
  awards: string;
  evaluation: string;
  template?: string;
}

// 保存简历
export const saveResume = (data: ResumeData) => {
  return service({
    url: '/resume/save',
    method: 'post',
    data,
  });
};

// 获取我的简历
export const getResume = () => {
  return service({
    url: '/resume/get',
    method: 'get',
  });
};

// 获取分享的简历
export const getResumeShare = (id: string) => {
  return service({
    url: `/resume/share/${id}`,
    method: 'get',
  });
};

// 导出简历 PDF
export const exportResumePdf = (data: ResumeData) => {
  return service({
    url: '/resume/export',
    method: 'post',
    data,
    responseType: 'blob',
  });
};
