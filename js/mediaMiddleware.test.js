import mediaMiddleware from "./mediaMiddleware";
import { LOAD_AUDIO_FILE } from "./actionTypes";

const mockMedia = {
  addEventListener: jest.fn(),
  loadFromFileReference: jest.fn()
};
const mockStore = {};
const mockNext = jest.fn();

const middleware = mediaMiddleware(mockMedia)(mockStore)(mockNext);

describe("Inbound actions", () => {
  it("intercepts LOAD_AUDIO_FILE", () => {
    const mockFile = { fileReference: {} };
    middleware({ type: LOAD_AUDIO_FILE, file: mockFile });
    expect(mockMedia.loadFromFileReference).toHaveBeenCalledWith(
      mockFile.fileReference
    );
  });
});
