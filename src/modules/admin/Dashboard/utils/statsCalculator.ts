export const calculateCareerCompassChange = (assessmentResults: any[]) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const currentMonthCount = assessmentResults.filter((result) => {
    const completedDate = new Date(result.completedAt);
    return completedDate >= currentMonthStart;
  }).length;

  const lastMonthCount = assessmentResults.filter((result) => {
    const completedDate = new Date(result.completedAt);
    return completedDate >= lastMonthStart && completedDate <= lastMonthEnd;
  }).length;

  if (lastMonthCount === 0) {
    return currentMonthCount > 0 ? { change: "+100%", positive: true } : { change: "0%", positive: true };
  }

  const percentChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
  const isPositive = percentChange >= 0;
  const changeStr = `${isPositive ? "+" : ""}${Math.round(percentChange)}%`;

  return { change: changeStr, positive: isPositive };
};

export const calculateEnrollmentCount = (data: any) =>
  data?.data?.reduce((total: number, batch: any) => total + (batch.usereportresponse?.length || 0), 0) || 0;
