const media = {
  addEventListener: jest.fn(),
  setVolume: jest.fn(),
  setBalance: jest.fn(),
  setPreamp: jest.fn(),
  getAnalyser: () => null,
  on: jest.fn(),
};
export default media;
