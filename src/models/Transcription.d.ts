import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
}, mongoose.Document<unknown, {}, {
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    fileName: string;
    originalName: string;
    language: string;
    text: string;
    processingTime?: number | null;
    segments: any[];
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Transcription.d.ts.map