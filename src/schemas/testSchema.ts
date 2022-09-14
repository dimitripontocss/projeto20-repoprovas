import joi from 'joi';

export const testSchema = joi.object({
    name: joi.string().required(),
    pdfUrl: joi.string().uri().required(),
    categoryName: joi.string().required(),
    teacherName: joi.string().required(),
    disciplineName: joi.string().required()
})