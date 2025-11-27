const { requestLogger, logger } = require('../middleware/logger');

describe('Request Logger Middleware', () => {
    let req, res, next;
    let consoleLogSpy, consoleErrorSpy;

    beforeEach(() => {
        req = {
            method: 'GET',
            url: '/api/test',
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' },
            get: jest.fn().mockReturnValue('test-user-agent')
        };

        res = {
            send: jest.fn(),
            get: jest.fn().mockReturnValue('100'),
            statusCode: 200
        };

        next = jest.fn();

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should log incoming request', () => {
        requestLogger(req, res, next);

        expect(consoleLogSpy).toHaveBeenCalled();
        const logCall = JSON.parse(consoleLogSpy.mock.calls[0][0]);
        expect(logCall.level).toBe('info');
        expect(logCall.message).toBe('Incoming request');
        expect(logCall.method).toBe('GET');
        expect(logCall.url).toBe('/api/test');
    });

    it('should call next middleware', () => {
        requestLogger(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should log response when res.send is called', () => {
        requestLogger(req, res, next);

        res.send('test response');

        const responseLogs = consoleLogSpy.mock.calls.filter(call => {
            try {
                const log = JSON.parse(call[0]);
                return log.message === 'Response sent';
            } catch {
                return false;
            }
        });

        expect(responseLogs.length).toBeGreaterThan(0);
    });
});

describe('Logger', () => {
    let consoleLogSpy, consoleErrorSpy, consoleWarnSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    it('should log info messages', () => {
        logger.info('Test message', { extra: 'data' });

        expect(consoleLogSpy).toHaveBeenCalled();
        const logCall = JSON.parse(consoleLogSpy.mock.calls[0][0]);
        expect(logCall.level).toBe('info');
        expect(logCall.message).toBe('Test message');
        expect(logCall.extra).toBe('data');
    });

    it('should log error messages', () => {
        logger.error('Error message');

        expect(consoleErrorSpy).toHaveBeenCalled();
        const logCall = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(logCall.level).toBe('error');
        expect(logCall.message).toBe('Error message');
    });

    it('should log warning messages', () => {
        logger.warn('Warning message');

        expect(consoleWarnSpy).toHaveBeenCalled();
        const logCall = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
        expect(logCall.level).toBe('warn');
        expect(logCall.message).toBe('Warning message');
    });

    it('should include timestamp', () => {
        logger.info('Test');

        const logCall = JSON.parse(consoleLogSpy.mock.calls[0][0]);
        expect(logCall.timestamp).toBeDefined();
        expect(new Date(logCall.timestamp)).toBeInstanceOf(Date);
    });
});
