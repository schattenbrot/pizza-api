const isTokenExpired = (expires: number) => {
  const currentTime = Date.now();
  console.log(currentTime, expires);

  return currentTime > expires;
};

export default isTokenExpired;
