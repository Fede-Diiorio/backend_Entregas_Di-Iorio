import { logger } from '../utils/logger.js';

export const useLogger = (req, _, next) => {
    req.logger = logger;
    next();
};