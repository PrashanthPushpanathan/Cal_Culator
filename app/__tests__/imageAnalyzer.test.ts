import { ImageAnalyzer } from '../utils/ImageAnalyzer';

// Mocks vorbereiten
const mockReadAsStringAsync = jest.fn();
const mockCreateCompletion = jest.fn();

jest.mock('expo-file-system', () => ({
  readAsStringAsync: (...args: unknown[]) => mockReadAsStringAsync(...args),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        GptToken: 'test-token', // in Tests egal, wir rufen OpenAI nicht wirklich
      },
    },
  },
}));

jest.mock('openai', () => {
  return {
    __esModule: true,
    OpenAI: jest.fn(() => ({
      chat: {
        completions: {
          create: (...args: unknown[]) => mockCreateCompletion(...args),
        },
      },
    })),
  };
});

describe('ImageAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gibt Nährwerte aus, wenn OpenAI gültiges JSON liefert', async () => {
    // FileSystem-Mock: Bild wird als Base64 gelesen
    mockReadAsStringAsync.mockResolvedValueOnce('BASE64DATA');

    // OpenAI-Mock: gültiges JSON als content
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              calories: 500,
              protein: 30,
              fat: 20,
              carbohydrates: 50,
            }),
          },
        },
      ],
    };
    mockCreateCompletion.mockResolvedValueOnce(mockResponse);

    const result = await ImageAnalyzer.analyseImage('file://image.jpg');

    // Prüfen, dass FileSystem korrekt aufgerufen wurde
    expect(mockReadAsStringAsync).toHaveBeenCalledWith('file://image.jpg', {
      encoding: 'base64',
    });

    // Prüfen, dass OpenAI mit einem Base64-Image aufgerufen wurde
    expect(mockCreateCompletion).toHaveBeenCalled();
    const callArgs = mockCreateCompletion.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4.1-mini');
    expect(callArgs.messages[0].content[1].image_url.url).toContain(
      'data:image/jpeg;base64,BASE64DATA',
    );

    // Prüfen, dass das Ergebnis korrekt gemappt wird
    expect(result).toEqual({
      calories: 500,
      protein: 30,
      fat: 20,
      carbohydrates: 50,
    });
  });

  it('gibt 0‑Werte zurück, wenn das JSON ungültig ist', async () => {
    mockReadAsStringAsync.mockResolvedValueOnce('BASE64DATA');

    // Ungültiges JSON
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'NOT_JSON',
          },
        },
      ],
    };
    mockCreateCompletion.mockResolvedValueOnce(mockResponse);

    const result = await ImageAnalyzer.analyseImage('file://image.jpg');

    expect(result).toEqual({
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    });
  });

  it('gibt 0‑Werte zurück, wenn FileSystem einen Fehler wirft', async () => {
    mockReadAsStringAsync.mockRejectedValueOnce(new Error('FS error'));

    const result = await ImageAnalyzer.analyseImage('file://image.jpg');

    expect(result).toEqual({
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    });
    expect(mockCreateCompletion).not.toHaveBeenCalled();
  });
});
