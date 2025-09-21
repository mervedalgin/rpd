import React, { useState, useEffect } from 'react';
import { Bot, FileText, Settings } from 'lucide-react';
import ExcelUpload from './components/ExcelUpload';
import RPDForm from './components/RPDForm';
import ScriptGenerator from './components/ScriptGenerator';
import embeddedData from '../data.json';

interface ExcelData {
  [sheetName: string]: Array<{ value: string; text: string }>;
}

interface FormData {
  sinifSube: string;
  ogrenci: string;
  rpdHizmetTuru: string;
  asama1: string;
  asama2: string;
  asama3: string;
  gorusmeTarihi: string;
  gorusmeBaslamaSaati: string;
  gorusmeBitisSaati: string;
  calismaYeri: string;
}

interface BulkFormData {
  records: FormData[];
  isBulkMode: boolean;
}

function App() {
  const [excelData, setExcelData] = useState<ExcelData>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<FormData | null>(null);
  const [bulkData, setBulkData] = useState<BulkFormData>({ records: [], isBulkMode: false });
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'script'>('upload');
  const [isEmbeddedData, setIsEmbeddedData] = useState(true);

  // Load embedded data on component mount
  useEffect(() => {
    loadEmbeddedData();
  }, []);

  const loadEmbeddedData = () => {
    // Convert embedded data to the expected format
    const formattedData: ExcelData = {};
    
    Object.keys(embeddedData).forEach(key => {
      if (Array.isArray(embeddedData[key as keyof typeof embeddedData])) {
        formattedData[key] = embeddedData[key as keyof typeof embeddedData] as Array<{ value: string; text: string }>;
      }
    });
    
    setExcelData(formattedData);
    setIsDataLoaded(true);
    setIsEmbeddedData(true);
    setCurrentStep('form');
  };

  const handleDataLoaded = (data: ExcelData) => {
    setExcelData(data);
    setIsDataLoaded(true);
    setIsEmbeddedData(false);
    setCurrentStep('form');
  };

  const switchToUpload = () => {
    setCurrentStep('upload');
    setIsEmbeddedData(false);
  };

  const handleGenerateScript = (formData: FormData) => {
    setGeneratedScript(formData);
    setBulkData({ records: [], isBulkMode: false }); // Reset bulk data for single mode
    setCurrentStep('script');
  };

  const handleBulkGenerateScript = (bulkFormData: BulkFormData) => {
    setBulkData(bulkFormData);
    setGeneratedScript(null); // Reset single form data for bulk mode
    setCurrentStep('script');
  };

  const resetProcess = () => {
    loadEmbeddedData(); // Reset to embedded data
    setBulkData({ records: [], isBulkMode: false });
    setGeneratedScript(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="text-blue-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RPD Automation Tool</h1>
                <p className="text-sm text-gray-600">MEB RPD Sistemi için Selenium Otomasyon Aracı</p>
              </div>
            </div>
            
            {isDataLoaded && (
              <div className="flex items-center space-x-3">
                {!isEmbeddedData && (
                  <button
                    onClick={resetProcess}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Settings className="mr-2" size={16} />
                    Varsayılan Verilere Dön
                  </button>
                )}
                <button
                  onClick={switchToUpload}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FileText className="mr-2" size={16} />
                  Excel Yükle
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            {/* Step 1 */}
            <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : isDataLoaded ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                currentStep === 'upload' ? 'border-blue-600 bg-blue-50' : 
                isDataLoaded ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Excel Yükleme</span>
            </div>

            {/* Arrow */}
            <div className={`w-8 h-0.5 ${isDataLoaded ? 'bg-green-300' : 'bg-gray-300'}`}></div>

            {/* Step 2 */}
            <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : generatedScript ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                currentStep === 'form' ? 'border-blue-600 bg-blue-50' : 
                generatedScript ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Form Doldurma</span>
            </div>

            {/* Arrow */}
            <div className={`w-8 h-0.5 ${generatedScript ? 'bg-green-300' : 'bg-gray-300'}`}></div>

            {/* Step 3 */}
            <div className={`flex items-center ${currentStep === 'script' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                currentStep === 'script' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}>
                3
              </div>
              <p className="text-sm text-gray-600">MEB RPD Sistemi için Excel Tabanlı Selenium Otomasyon Aracı</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <ExcelUpload 
              onDataLoaded={handleDataLoaded}
              isDataLoaded={false}
              isEmbeddedDataAvailable={true}
              onUseEmbeddedData={loadEmbeddedData}
            />
          )}

          {currentStep === 'form' && isDataLoaded && (
            <RPDForm
              excelData={excelData}
              onGenerateScript={handleGenerateScript}
              onBulkGenerateScript={handleBulkGenerateScript}
            />
          )}

          {currentStep === 'script' && (generatedScript || bulkData.isBulkMode) && (
            <ScriptGenerator 
              formData={generatedScript} 
              bulkData={bulkData.isBulkMode ? bulkData : undefined}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center mb-2">
              <FileText className="mr-2" size={16} />
              <span>RPD Automation Tool - Excel Tabanlı MEB Sistemi Entegrasyonu</span>
            </div>
            <p>Bu araç, Excel verilerini kullanarak MEB RPD sistemindeki form doldurma işlemlerini otomatikleştirmek için tasarlanmıştır.</p>
            <p className="mt-1 text-xs">Sistem değer kodlarını kullanarak Türkçe karakter sorunlarını önler.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;