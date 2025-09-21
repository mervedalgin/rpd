import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Save, Code, Plus, Trash2, Users, FileCode } from 'lucide-react';

interface ExcelData {
  [sheetName: string]: Array<{ value: string; text: string }>;
}

interface RpdStageData {
  metadata: {
    generated_at: string;
    total_services: number;
  };
  services: {
    [serviceCode: string]: {
      hizmet_adi: string;
      asama_1: {
        secenekler: Array<{ deger: string; metin: string }>;
        toplam: number;
      };
      asama_2_bagimliliklari: {
        [stage1Name: string]: {
          asama_1_deger: string;
          secenekler: Array<{ deger: string; metin: string }>;
          toplam: number;
        };
      };
      asama_3_bagimliliklari: {
        [combinedName: string]: {
          asama_1_deger: string;
          asama_2_deger: string;
          secenekler: Array<{ deger: string; metin: string }>;
          toplam: number;
        };
      };
    };
  };
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

interface RPDFormProps {
  excelData: ExcelData;
  onGenerateScript: (formData: FormData) => void;
  onBulkGenerateScript: (bulkData: BulkFormData) => void;
}

const RPDForm: React.FC<RPDFormProps> = ({ excelData, onGenerateScript, onBulkGenerateScript }) => {
  const [rpdStageData, setRpdStageData] = useState<RpdStageData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    sinifSube: '',
    ogrenci: '',
    rpdHizmetTuru: '',
    asama1: '',
    asama2: '',
    asama3: '',
    gorusmeTarihi: '',
    gorusmeBaslamaSaati: '',
    gorusmeBitisSaati: '',
    calismaYeri: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkRecords, setBulkRecords] = useState<FormData[]>([]);

  // RPD aşama verilerini yükle
  useEffect(() => {
    const loadRpdStageData = async () => {
      try {
        const response = await fetch('/rpd_asamalar.json');
        const data = await response.json();
        setRpdStageData(data);
        console.log('RPD aşama verileri yüklendi:', data);
      } catch (error) {
        console.error('RPD aşama verileri yüklenemedi:', error);
      }
    };

    loadRpdStageData();
  }, []);

  // RPD Hizmet Türü seçimine göre 1. Aşama listesini getir
  const getStage1List = () => {
    if (!formData.rpdHizmetTuru || !rpdStageData) return [];
    
    const serviceCode = formData.rpdHizmetTuru; // örn: "5", "6", "7"
    const serviceData = rpdStageData.services[serviceCode];
    
    if (!serviceData) {
      console.log('1. Aşama için hizmet bulunamadı:', serviceCode);
      return [];
    }
    
    const options = serviceData.asama_1.secenekler.map(item => ({
      value: item.deger,
      text: item.metin
    }));
    
    console.log('1. Aşama için yüklenen seçenekler:', options);
    return options;
  };

  // 1. Aşama seçimine göre 2. Aşama listesini getir
  const getStage2List = () => {
    if (!formData.asama1 || !formData.rpdHizmetTuru || !rpdStageData) return [];
    
    const serviceCode = formData.rpdHizmetTuru;
    const serviceData = rpdStageData.services[serviceCode];
    
    if (!serviceData) {
      console.log('2. Aşama için hizmet bulunamadı:', serviceCode);
      return [];
    }
    
    // 1. Aşama seçeneğini bul
    const stage1Option = serviceData.asama_1.secenekler.find(item => item.deger === formData.asama1);
    if (!stage1Option) {
      console.log('2. Aşama için 1. aşama seçeneği bulunamadı:', formData.asama1);
      return [];
    }
    
    // 2. Aşama bağımlılıklarında bu seçeneği ara
    const stage2Dependency = serviceData.asama_2_bagimliliklari[stage1Option.metin];
    if (!stage2Dependency) {
      console.log('2. Aşama için bağımlılık bulunamadı:', stage1Option.metin);
      return [];
    }
    
    const options = stage2Dependency.secenekler.map(item => ({
      value: item.deger,
      text: item.metin
    }));
    
    console.log('2. Aşama için yüklenen seçenekler:', options);
    return options;
  };

  // 2. Aşama seçimine göre 3. Aşama listesini getir
  const getStage3List = () => {
    if (!formData.asama2 || !formData.asama1 || !formData.rpdHizmetTuru || !rpdStageData) return [];
    
    const serviceCode = formData.rpdHizmetTuru;
    const serviceData = rpdStageData.services[serviceCode];
    
    if (!serviceData) {
      console.log('3. Aşama için hizmet bulunamadı:', serviceCode);
      return [];
    }
    
    // 1. ve 2. Aşama seçeneklerini bul
    const stage1Option = serviceData.asama_1.secenekler.find(item => item.deger === formData.asama1);
    if (!stage1Option) {
      console.log('3. Aşama için 1. aşama seçeneği bulunamadı:', formData.asama1);
      return [];
    }
    
    const stage2Dependency = serviceData.asama_2_bagimliliklari[stage1Option.metin];
    if (!stage2Dependency) {
      console.log('3. Aşama için 2. aşama bağımlılığı bulunamadı:', stage1Option.metin);
      return [];
    }
    
    const stage2Option = stage2Dependency.secenekler.find(item => item.deger === formData.asama2);
    if (!stage2Option) {
      console.log('3. Aşama için 2. aşama seçeneği bulunamadı:', formData.asama2);
      return [];
    }
    
    // 3. Aşama bağımlılıklarında kombine anahtarı ara
    const combinedKey = `${stage1Option.metin} → ${stage2Option.metin}`;
    const stage3Dependency = serviceData.asama_3_bagimliliklari[combinedKey];
    
    if (!stage3Dependency) {
      console.log('3. Aşama için bağımlılık bulunamadı:', combinedKey);
      return [];
    }
    
    const options = stage3Dependency.secenekler.map(item => ({
      value: item.deger,
      text: item.metin
    }));
    
    console.log('3. Aşama için yüklenen seçenekler:', options);
    return options;
  };

  // Şube seçimine göre öğrenci listesini getir
  const getStudentList = () => {
    if (!formData.sinifSube) return [];
    
    // Debug: Mevcut sayfa adlarını konsola yazdır
    console.log('Mevcut Excel sayfaları:', Object.keys(excelData));
    console.log('Seçilen şube:', formData.sinifSube);
    
    // Önce mevcut sayfa adlarını kontrol et
    const availableSheets = Object.keys(excelData);
    const studentSheets = availableSheets.filter(sheet => 
      sheet.toLowerCase().includes('ogrenci') || 
      sheet.toLowerCase().includes('öğrenci') ||
      sheet.toLowerCase().includes('student')
    );
    
    console.log('Öğrenci sayfaları:', studentSheets);
    
    // Seçilen sınıf/şube bilgisinden text değerini al
    const selectedOption = excelData['Sinif_Sube']?.find(option => option.value === formData.sinifSube);
    if (!selectedOption) {
      console.log('Seçilen şube bilgisi bulunamadı:', formData.sinifSube);
      return [];
    }
    
    const selectedText = selectedOption.text; // örn: "Ana Sınıfı / A Şubesi", "1. Sınıf / B Şubesi"
    console.log('Seçilen şube metni:', selectedText);
    
    // Text'i kullanarak uygun sayfa adını oluştur
    const normalizedText = selectedText.replace('/', '_'); // "Ana Sınıfı / A Şubesi" -> "Ana Sınıfı _ A Şubesi"
    const targetSheetName = `Ogrenci_${normalizedText}`;
    
    console.log('Aranan hedef sayfa adı:', targetSheetName);
    
    // Tam eşleşme ara
    let targetSheet = studentSheets.find(sheet => sheet === targetSheetName);
    
    // Tam eşleşme bulunamazsa, benzer eşleşme ara
    if (!targetSheet) {
      // Sınıf ve şube bilgilerini ayır
      const parts = selectedText.split(' / ');
      if (parts.length === 2) {
        const className = parts[0]; // "Ana Sınıfı", "1. Sınıf", vb.
        const branchName = parts[1]; // "A Şubesi", "B Şubesi", vb.
        
        console.log('Sınıf:', className, 'Şube:', branchName);
        
        // Her iki parçayı da içeren sayfa ara
        targetSheet = studentSheets.find(sheet => {
          const sheetLower = sheet.toLowerCase();
          const classLower = className.toLowerCase();
          const branchLower = branchName.toLowerCase();
          
          return sheetLower.includes(classLower) && sheetLower.includes(branchLower);
        });
        
        // Hala bulunamazsa, sadece sınıf adına göre ara
        if (!targetSheet) {
          targetSheet = studentSheets.find(sheet => {
            const sheetLower = sheet.toLowerCase();
            const classLower = className.toLowerCase();
            return sheetLower.includes(classLower);
          });
        }
      }
    }
    
    console.log('Bulunan hedef sayfa:', targetSheet);
    
    if (targetSheet && excelData[targetSheet]) {
      console.log('Öğrenci listesi yüklendi:', excelData[targetSheet].length, 'öğrenci');
      return excelData[targetSheet];
    }
    
    console.log('Hiçbir uygun öğrenci sayfası bulunamadı');
    return [];
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Hiyerarşik bağımlılık: Üst seviye değiştiğinde alt seviyeleri sıfırla
      if (field === 'sinifSube') {
        newData.ogrenci = '';
      } else if (field === 'rpdHizmetTuru') {
        newData.asama1 = '';
        newData.asama2 = '';
        newData.asama3 = '';
      } else if (field === 'asama1') {
        newData.asama2 = '';
        newData.asama3 = '';
      } else if (field === 'asama2') {
        newData.asama3 = '';
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.sinifSube) newErrors.sinifSube = 'Sınıf/Şube seçimi zorunludur';
    if (!formData.ogrenci) newErrors.ogrenci = 'Öğrenci seçimi zorunludur';
    if (!formData.rpdHizmetTuru) newErrors.rpdHizmetTuru = 'RPD Hizmet Türü seçimi zorunludur';
    if (!formData.asama1) newErrors.asama1 = '1. Aşama seçimi zorunludur';
    if (!formData.asama2) newErrors.asama2 = '2. Aşama seçimi zorunludur';
    
    // 3. Aşama sadece İP (Psikososyal Müdahale) için zorunlu
    const isStage3Required = formData.asama1 === '18'; // İP - Psikososyal Müdahale
    if (isStage3Required && !formData.asama3) {
      newErrors.asama3 = '3. Aşama seçimi bu hizmet türü için zorunludur';
    }
    
    if (!formData.gorusmeTarihi) newErrors.gorusmeTarihi = 'Görüşme tarihi zorunludur';
    if (!formData.gorusmeBaslamaSaati) newErrors.gorusmeBaslamaSaati = 'Başlama saati zorunludur';
    if (!formData.gorusmeBitisSaati) newErrors.gorusmeBitisSaati = 'Bitiş saati zorunludur';
    if (!formData.calismaYeri) newErrors.calismaYeri = 'Çalışma yeri seçimi zorunludur';

    // Saat kontrolü
    if (formData.gorusmeBaslamaSaati && formData.gorusmeBitisSaati) {
      if (formData.gorusmeBaslamaSaati >= formData.gorusmeBitisSaati) {
        newErrors.gorusmeBitisSaati = 'Bitiş saati, başlama saatinden sonra olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isBulkMode) {
        // Add current form to bulk records
        const newRecords = [...bulkRecords, { ...formData }];
        setBulkRecords(newRecords);
        // Reset form for next entry
        setFormData({
          sinifSube: '',
          ogrenci: '',
          rpdHizmetTuru: '',
          asama1: '',
          asama2: '',
          asama3: '',
          gorusmeTarihi: '',
          gorusmeBaslamaSaati: '',
          gorusmeBitisSaati: '',
          calismaYeri: ''
        });
      } else {
        onGenerateScript(formData);
      }
    }
  };

  const handleBulkFinish = () => {
    if (bulkRecords.length > 0) {
      onBulkGenerateScript({ records: bulkRecords, isBulkMode: true });
    }
  };

  const removeBulkRecord = (index: number) => {
    setBulkRecords(prev => prev.filter((_, i) => i !== index));
  };

  const clearBulkRecords = () => {
    setBulkRecords([]);
  };

  const renderSelect = (
    label: string,
    field: keyof FormData,
    dataKey: string,
    icon: React.ReactNode
  ) => {
    const options = excelData[dataKey] || [];
    
    // Debug: Aşama seçimleri için bilgi yazdır
    if (dataKey.includes('Asama') || dataKey.includes('asama')) {
      console.log(`${label} için aranan sayfa:`, dataKey);
      console.log(`${label} için bulunan veri:`, options);
      console.log('Mevcut tüm sayfalar:', Object.keys(excelData));
    }
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          {icon}
          {label}
        </label>
        <select
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <option value="">Seçiniz...</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
        {formData[field] && (
          <p className="mt-1 text-xs text-gray-500">
            Sistem değeri: <code className="bg-gray-100 px-1 rounded">{formData[field]}</code>
          </p>
        )}
        {errors[field] && (
          <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Save className="mr-2" size={20} />
        RPD Form Bilgileri
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderSelect(
              'Sınıf / Şube',
              'sinifSube',
              'Sinif_Sube',
              <Calendar className="mr-2" size={16} />
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                Öğrenci
              </label>
              <select
                key={formData.sinifSube} // Sınıf değiştiğinde dropdown'ı yenile
                value={formData.ogrenci}
                onChange={(e) => handleInputChange('ogrenci', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.ogrenci ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={!formData.sinifSube}
              >
                <option value="">
                  {!formData.sinifSube ? 'Önce şube seçiniz...' : 'Seçiniz...'}
                </option>
                {getStudentList().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {formData.ogrenci && (
                <p className="mt-1 text-xs text-gray-500">
                  Sistem değeri: <code className="bg-gray-100 px-1 rounded">{formData.ogrenci}</code>
                </p>
              )}
              {errors.ogrenci && (
                <p className="mt-1 text-sm text-red-600">{errors.ogrenci}</p>
              )}
              {formData.sinifSube && getStudentList().length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Bu şube için öğrenci listesi bulunamadı.
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">
                    Mevcut Excel sayfaları:
                  </p>
                  <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                    {Object.keys(excelData).map(sheet => (
                      <div key={sheet}>• {sheet}</div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    Öğrenci sayfaları "ogrenci", "öğrenci" veya "student" kelimesini içermelidir.
                  </p>
                </div>
              )}
            </div>
            
            {renderSelect(
              'RPD Hizmet Türü',
              'rpdHizmetTuru',
              'RPD_Hizmet_Turu',
              <Calendar className="mr-2" size={16} />
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                1. Aşama
              </label>
              <select
                value={formData.asama1}
                onChange={(e) => handleInputChange('asama1', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.asama1 ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={!formData.rpdHizmetTuru || !rpdStageData}
              >
                <option value="">
                  {!formData.rpdHizmetTuru ? 'Önce RPD Hizmet Türü seçiniz...' : 
                   !rpdStageData ? 'Aşama verileri yükleniyor...' : 'Seçiniz...'}
                </option>
                {getStage1List().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {formData.asama1 && (
                <p className="mt-1 text-xs text-gray-500">
                  Sistem değeri: <code className="bg-gray-100 px-1 rounded">{formData.asama1}</code>
                </p>
              )}
              {errors.asama1 && (
                <p className="mt-1 text-sm text-red-600">{errors.asama1}</p>
              )}
              {formData.rpdHizmetTuru && rpdStageData && getStage1List().length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  1. Aşama verileri bulunamadı. Seçilen hizmet türü için veri kontrolü yapınız.
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                2. Aşama
              </label>
              <select
                value={formData.asama2}
                onChange={(e) => handleInputChange('asama2', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.asama2 ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={!formData.asama1 || !rpdStageData}
              >
                <option value="">
                  {!formData.asama1 ? 'Önce 1. Aşama seçiniz...' : 
                   !rpdStageData ? 'Aşama verileri yükleniyor...' : 'Seçiniz...'}
                </option>
                {getStage2List().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {formData.asama2 && (
                <p className="mt-1 text-xs text-gray-500">
                  Sistem değeri: <code className="bg-gray-100 px-1 rounded">{formData.asama2}</code>
                </p>
              )}
              {errors.asama2 && (
                <p className="mt-1 text-sm text-red-600">{errors.asama2}</p>
              )}
              {formData.asama1 && rpdStageData && getStage2List().length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  2. Aşama verileri bulunamadı. Seçilen 1. aşama için veri kontrolü yapınız.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                3. Aşama
                {formData.asama1 !== '18' && formData.asama2 && (
                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    (Opsiyonel)
                  </span>
                )}
                {formData.asama1 === '18' && (
                  <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    (Zorunlu)
                  </span>
                )}
              </label>
              <select
                value={formData.asama3}
                onChange={(e) => handleInputChange('asama3', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.asama3 ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={!formData.asama2 || !rpdStageData}
              >
                <option value="">
                  {!formData.asama2 ? 'Önce 2. Aşama seçiniz...' : 
                   !rpdStageData ? 'Aşama verileri yükleniyor...' : 
                   formData.asama1 !== '18' ? 'Seçiniz... (opsiyonel)' : 'Seçiniz...'}
                </option>
                {getStage3List().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {formData.asama3 && (
                <p className="mt-1 text-xs text-gray-500">
                  Sistem değeri: <code className="bg-gray-100 px-1 rounded">{formData.asama3}</code>
                </p>
              )}
              {errors.asama3 && (
                <p className="mt-1 text-sm text-red-600">{errors.asama3}</p>
              )}
              {formData.asama2 && rpdStageData && getStage3List().length === 0 && formData.asama1 !== '17' && formData.asama1 !== '19' && (
                <p className="mt-1 text-sm text-yellow-600">
                  3. Aşama verileri bulunamadı. Seçilen 2. aşama için veri kontrolü yapınız.
                </p>
              )}
              {formData.asama2 && (formData.asama1 === '17' || formData.asama1 === '19') && (
                <p className="mt-1 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  İB (Bireysel Psikolojik Danışma) ve İS (Sevk) hizmetleri için 3. Aşama seçimi opsiyoneldir.
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                Görüşme Tarihi
              </label>
              <input
                type="date"
                value={formData.gorusmeTarihi}
                onChange={(e) => handleInputChange('gorusmeTarihi', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.gorusmeTarihi ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.gorusmeTarihi && (
                <p className="mt-1 text-sm text-red-600">{errors.gorusmeTarihi}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="mr-2" size={16} />
                  Başlama Saati
                </label>
                <input
                  type="time"
                  value={formData.gorusmeBaslamaSaati}
                  onChange={(e) => handleInputChange('gorusmeBaslamaSaati', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.gorusmeBaslamaSaati ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.gorusmeBaslamaSaati && (
                  <p className="mt-1 text-sm text-red-600">{errors.gorusmeBaslamaSaati}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="mr-2" size={16} />
                  Bitiş Saati
                </label>
                <input
                  type="time"
                  value={formData.gorusmeBitisSaati}
                  onChange={(e) => handleInputChange('gorusmeBitisSaati', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.gorusmeBitisSaati ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.gorusmeBitisSaati && (
                  <p className="mt-1 text-sm text-red-600">{errors.gorusmeBitisSaati}</p>
                )}
              </div>
            </div>
            
            {renderSelect(
              'Çalışmanın Yapıldığı Yer',
              'calismaYeri',
              'Calisma_Yeri',
              <MapPin className="mr-2" size={16} />
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          {/* Mode Toggle */}
          <div className="mb-4 flex items-center justify-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                checked={!isBulkMode}
                onChange={() => {
                  setIsBulkMode(false);
                  setBulkRecords([]);
                }}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Tekli Kayıt</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                checked={isBulkMode}
                onChange={() => setIsBulkMode(true)}
                className="mr-2"
              />
              <Users className="mr-1" size={16} />
              <span className="text-sm font-medium text-gray-700">Çoklu Kayıt</span>
            </label>
          </div>

          {/* Single Mode Button */}
          {!isBulkMode && (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              <Code className="mr-2" size={18} />
              Selenium Kodunu Oluştur
            </button>
          )}

          {/* Bulk Mode Controls */}
          {isBulkMode && (
            <div className="space-y-4">
              {/* Add Record Button */}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <Plus className="mr-2" size={18} />
                Kayıt Ekle ({bulkRecords.length} kayıt)
              </button>

              {/* Bulk Records List */}
              {bulkRecords.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">Eklenen Kayıtlar ({bulkRecords.length})</h4>
                    <button
                      type="button"
                      onClick={clearBulkRecords}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Tümünü Temizle
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bulkRecords.map((record, index) => {
                      const studentName = excelData.Sinif_Sube?.find(s => s.value === record.sinifSube)?.text || record.sinifSube;
                      const serviceName = excelData.RPD_Hizmet_Turu?.find(s => s.value === record.rpdHizmetTuru)?.text || record.rpdHizmetTuru;
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">
                              {studentName}
                            </div>
                            <div className="text-gray-600">
                              {serviceName} • {record.gorusmeTarihi}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBulkRecord(index)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Kaydı Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Generate Bulk Script Button */}
              {bulkRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkFinish}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  <FileCode className="mr-2" size={18} />
                  Toplu Selenium Kodunu Oluştur ({bulkRecords.length} kayıt)
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RPDForm;