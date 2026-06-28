import React, { useState, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
}

export function ImageUpload({ imagePreview, onImageChange }: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    onImageChange(file, url);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2" id="image-upload-component">
      <label className="text-sm font-medium text-slate-300">Evidence Photograph</label>
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
          imagePreview 
            ? 'border-emerald-500/50 bg-emerald-950/10' 
            : isDragActive
            ? 'border-emerald-500 bg-emerald-950/20 shadow-md scale-[1.01]'
            : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative group w-full h-40 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={imagePreview} 
              alt="Uploaded issue evidence" 
              className="object-cover w-full h-full rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition shadow-lg cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <div className="p-3 bg-slate-800 rounded-full text-emerald-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your image here, or <span className="text-emerald-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, or JPEG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
