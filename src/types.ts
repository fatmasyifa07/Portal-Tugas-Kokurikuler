/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DestinationType = 'jogjakarta' | 'blitar' | 'mandiri' | 'teknologi_tepat_guna';

export interface StudentIdentity {
  name: string;
  class: string;
}

export interface Question {
  id: string;
  label: string;
  placeholder: string;
  type: 'textarea' | 'text';
  required: boolean;
}

export interface Answer {
  questionId: string;
  answerText: string;
}

export interface ActivityReport {
  id: string;
  studentName: string;
  studentClass: string;
  destination: DestinationType;
  answers: Answer[];
  createdAt: string;
  reportNumber: string;
  uploadedPhotos?: string[];
  videoLink?: string;
}
