import { GenerationRequest } from '../types';

export interface ValidationErrors {
  businessName?: string;
  productService?: string;
  targetAudience?: string;
  platform?: string;
  contentType?: string;
  general?: string;
}

export function validateGenerationRequest(data: Partial<GenerationRequest>): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  if (!data.businessName || data.businessName.trim() === '') {
    errors.businessName = 'Business name is required.';
  } else if (data.businessName.trim().length < 2) {
    errors.businessName = 'Business name must be at least 2 characters.';
  }

  if (!data.productService || data.productService.trim() === '') {
    errors.productService = 'Product or service details are required.';
  } else if (data.productService.trim().length < 3) {
    errors.productService = 'Please provide a clear product/service description (at least 3 characters).';
  }

  if (!data.targetAudience || data.targetAudience.trim() === '') {
    errors.targetAudience = 'Target audience is required.';
  }

  if (!data.platform) {
    errors.platform = 'Please select a social media platform.';
  }

  if (!data.contentType) {
    errors.contentType = 'Please select a content type.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
