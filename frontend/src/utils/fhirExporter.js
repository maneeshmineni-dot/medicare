/**
 * HL7 FHIR (Fast Healthcare Interoperability Resources) Release 4 (R4) Exporter
 * Formats medication scans, prescriptions, and dual audits into official FHIR JSON bundles
 * for Electronic Health Record (EHR) interoperability (Epic, Cerner, Allscripts).
 */

export const generateFhirBundle = ({
  patientName = 'Patient / Self-Scan',
  medicationData = {},
  reportData = null,
  dualAuditData = null
}) => {
  const timestamp = new Date().toISOString();
  const bundleId = `bundle-pv-${Date.now()}`;
  const patientId = `patient-${Math.random().toString(36).substring(2, 9)}`;

  const entries = [];

  // 1. Patient Resource
  entries.push({
    fullUrl: `urn:uuid:${patientId}`,
    resource: {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      name: [{ use: 'official', text: patientName }],
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
      }
    }
  });

  // 2. MedicationStatement / Medication Resource
  if (medicationData.medicationName) {
    const medStatementId = `medstatement-${Math.random().toString(36).substring(2, 9)}`;
    const fda = medicationData.fdaData || {};
    const ncbi = medicationData.ncbiData || {};

    entries.push({
      fullUrl: `urn:uuid:${medStatementId}`,
      resource: {
        resourceType: 'MedicationStatement',
        id: medStatementId,
        status: 'active',
        subject: {
          reference: `urn:uuid:${patientId}`,
          display: patientName
        },
        effectiveDateTime: timestamp,
        medicationCodeableConcept: {
          coding: [
            ...(fda.productNdc ? [{
              system: 'http://hl7.org/fhir/sid/ndc',
              code: fda.productNdc,
              display: fda.brandName || medicationData.medicationName
            }] : []),
            ...(ncbi.pubchemCid ? [{
              system: 'https://pubchem.ncbi.nlm.nih.gov',
              code: String(ncbi.pubchemCid),
              display: ncbi.officialTitle || medicationData.medicationName
            }] : []),
            {
              system: 'http://snomed.info/sct',
              display: medicationData.medicationName
            }
          ],
          text: medicationData.medicationName
        },
        dosage: [
          {
            text: medicationData.dosageInstructions || 'Standard clinical administration',
            additionalInstruction: medicationData.warnings ? medicationData.warnings.map(w => ({ text: w })) : []
          }
        ],
        note: [
          { text: `Primary Indication: ${medicationData.primaryUse || 'N/A'}` },
          { text: `Mechanism of Action: ${medicationData.mechanismOfAction || 'N/A'}` },
          { text: `Pharmacological Class: ${medicationData.drugClass || 'N/A'}` }
        ]
      }
    });
  }

  // 3. DiagnosticReport Resource (if dual audit / lab report is provided)
  if (dualAuditData || reportData) {
    const diagId = `diagreport-${Math.random().toString(36).substring(2, 9)}`;
    const audit = dualAuditData?.auditSummary || {};

    entries.push({
      fullUrl: `urn:uuid:${diagId}`,
      resource: {
        resourceType: 'DiagnosticReport',
        id: diagId,
        status: 'final',
        category: [
          {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'LAB',
              display: 'Laboratory'
            }]
          }
        ],
        code: {
          text: audit.reportTitle || reportData?.reportTitle || 'Comprehensive Clinical Laboratory Report'
        },
        subject: {
          reference: `urn:uuid:${patientId}`
        },
        effectiveDateTime: timestamp,
        conclusion: audit.clinicalVerdict || 'Clinical Dual-Audit completed with biomarker alignment evaluation.',
        extension: [
          {
            url: 'https://pharmavision.ai/fhir/StructureDefinition/alignment-score',
            valueInteger: audit.overallAlignmentScore || 90
          }
        ]
      }
    });
  }

  const bundle = {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'collection',
    timestamp,
    meta: {
      source: 'PharmaVision AI Clinical Pharmacology Platform',
      versionId: '1.0',
      lastUpdated: timestamp
    },
    total: entries.length,
    entry: entries
  };

  return bundle;
};

/**
 * Downloads a generated FHIR Bundle JSON file
 */
export const downloadFhirBundle = (bundle, filename = 'pharmavision_fhir_bundle.json') => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
