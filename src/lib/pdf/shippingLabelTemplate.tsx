import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Svg,
  Path,
} from "@react-pdf/renderer";
import {
  ShippingLabelPDFData,
  cleanLabelAddress,
  cleanLabelObservations,
  extractRutFromObservations,
  formatCityDeptDisplay,
  normalizeAgencyDisplay,
} from "@/lib/shippingLabelUtils";

// Evita partir palabras con guiones al final de línea
Font.registerHyphenationCallback((word) => [word]);

// Dimensiones exactas en puntos PostScript (1 mm = 2.83464567 pt)
const PAPER_SPECS = {
  a6: {
    width: 297.64, // 105 mm
    height: 419.53, // 148 mm
    paddingTop: 11.3, // ~4.0 mm
    paddingBottom: 11.3,
    paddingLeft: 16.5, // ~5.8 mm
    paddingRight: 16.5,
    outerWidth: 264.64,
    outerHeight: 396.93,
  },
  thermal100x150: {
    width: 283.46, // 100 mm
    height: 425.2, // 150 mm
    paddingTop: 8.5, // ~3.0 mm
    paddingBottom: 8.5,
    paddingLeft: 8.5, // ~3.0 mm
    paddingRight: 8.5,
    outerWidth: 266.46,
    outerHeight: 408.2,
  },
} as const;

const styles = StyleSheet.create({
  pageBase: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  outerContainer: {
    borderWidth: 2.2,
    borderColor: "#000000",
    borderRadius: 11,
    padding: 7.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  // Header con Logo y Agencia/Modalidad
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.8,
    borderBottomColor: "#000000",
    paddingBottom: 4.5,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  brandTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000000",
    lineHeight: 1.05,
  },
  brandSubtitle: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#334155",
    marginTop: 1,
  },
  agencyCard: {
    borderWidth: 1.8,
    borderColor: "#000000",
    borderRadius: 5,
    overflow: "hidden",
    minWidth: 78,
  },
  agencyCardTop: {
    backgroundColor: "#000000",
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  agencyCardTopText: {
    color: "#ffffff",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  agencyCardBottom: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1.5,
    borderTopColor: "#000000",
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  agencyCardBottomText: {
    color: "#000000",
    fontSize: 9.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  // Remitente
  senderBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 0.9,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    marginVertical: 3,
  },
  senderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1.5,
  },
  senderTitle: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#475569",
  },
  senderMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  senderName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000000",
  },
  senderPhone: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  senderDetails: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    marginTop: 2,
  },
  // Destinatario
  destinatarioBox: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 7,
    flex: 1,
    marginVertical: 2.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  destinatarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.8,
    borderBottomColor: "#000000",
    paddingBottom: 3,
  },
  destinatarioTag: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#db2777",
  },
  destinatarioDeptBadge: {
    backgroundColor: "#000000",
    borderRadius: 3.5,
    paddingVertical: 2,
    paddingHorizontal: 6.5,
  },
  destinatarioDeptText: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  recipientMain: {
    paddingVertical: 3,
  },
  recipientNameText: {
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000000",
    lineHeight: 1.12,
  },
  recipientPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3.5,
  },
  recipientPhoneText: {
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginLeft: 4.5,
  },
  recipientCityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  recipientCityText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#1e293b",
    marginLeft: 4,
  },
  rutText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    backgroundColor: "#f1f5f9",
    borderWidth: 0.6,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  recipientAddressBox: {
    borderTopWidth: 1.8,
    borderTopColor: "#000000",
    paddingTop: 4.5,
    marginTop: 3,
  },
  addressSectionLabel: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 2,
  },
  recipientAddressText: {
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000000",
    lineHeight: 1.18,
  },
  observationsInline: {
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  // Frágil
  fragileBox: {
    borderWidth: 1.2,
    borderColor: "#ef4444",
    borderRadius: 5,
    backgroundColor: "#fef2f2",
    paddingVertical: 3,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2.5,
  },
  fragileText: {
    color: "#b91c1c",
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginLeft: 4,
    textAlign: "center",
  },
  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.6,
    borderTopColor: "#000000",
    paddingTop: 3.5,
  },
  orderNumberLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
  },
  orderNumberValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginTop: 1,
  },
  qrContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrTextContainer: {
    marginRight: 5,
    alignItems: "flex-end",
  },
  qrTitle: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  qrSubtitle: {
    fontSize: 5.8,
    color: "#64748b",
  },
  qrImage: {
    width: 30,
    height: 30,
    borderWidth: 1.4,
    borderColor: "#000000",
    borderRadius: 3.5,
    padding: 1,
  },
});

function stripNonPrintableSymbols(text: string): string {
  // Elimina emojis que Helvetica estándar no soporta en PDF
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const ShippingLabelPDFDocument: React.FC<{
  data: ShippingLabelPDFData;
  logoUrl?: string;
  qrUrl?: string;
}> = ({ data, logoUrl, qrUrl }) => {
  const formatKey = data.paperFormat === "thermal100x150" ? "thermal100x150" : "a6";
  const spec = PAPER_SPECS[formatKey];

  const isBw = data.printColorMode === "bw";
  const deliveryType = data.deliveryType || "agencia";
  const agencyDisplay = normalizeAgencyDisplay(data.shippingAgency);
  const deliveryBadge =
    deliveryType === "agencia"
      ? "AGENCIA"
      : deliveryType === "local"
      ? "LOCAL"
      : "DOMICILIO";

  const cityDept = formatCityDeptDisplay(data.recipientCity, data.recipientDept);
  const cleanAddress =
    deliveryType === "local"
      ? "LOCAL KAMALUSO (SAN JOSÉ DE MAYO)"
      : cleanLabelAddress(data.recipientAddress);
  const cleanObs = stripNonPrintableSymbols(cleanLabelObservations(data.observations));
  const resolvedRut =
    (data.rutInfo || "").trim() || extractRutFromObservations(data.observations);

  const nameLen = (data.recipientName || "").trim().length;
  const nameFontSize = nameLen > 35 ? 14.5 : nameLen > 22 ? 17 : 19.5;

  const phoneLen = (data.recipientPhone || "").trim().length;
  const phoneFontSize = phoneLen > 22 ? 13 : phoneLen > 16 ? 14.5 : 16;

  // Auto-escala sobre la longitud combinada de dirección + (observaciones)
  const combinedAddrLen = (
    cleanAddress + (cleanObs ? ` (${cleanObs})` : "")
  ).length;
  const addressFontSize =
    combinedAddrLen > 125
      ? 9
      : combinedAddrLen > 95
      ? 10
      : combinedAddrLen > 68
      ? 11.5
      : combinedAddrLen > 45
      ? 13
      : combinedAddrLen > 26
      ? 14.5
      : 16;

  const fragileText =
    stripNonPrintableSymbols(data.notes || "") ||
    "CUIDADO: FRÁGIL - PAPELERÍA SUBLIMABLE";

  const senderWebsite = (data.senderWebsite || "www.kamaluso.com").trim();
  const senderAddress = (data.senderAddress || "San José de Mayo, Uruguay").trim();
  const addressLabel =
    deliveryType === "agencia"
      ? "SUCURSAL DE RETIRO:"
      : deliveryType === "local"
      ? "PUNTO DE RETIRO:"
      : "DIRECCIÓN DE ENTREGA:";

  return (
    <Document title={`Etiqueta-${data.orderNumber || "Kamaluso"}`}>
      <Page
        size={{ width: spec.width, height: spec.height }}
        style={[
          styles.pageBase,
          {
            paddingTop: spec.paddingTop,
            paddingBottom: spec.paddingBottom,
            paddingLeft: spec.paddingLeft,
            paddingRight: spec.paddingRight,
          },
        ]}
      >
        <View
          style={[
            styles.outerContainer,
            {
              width: spec.outerWidth,
              height: spec.outerHeight,
            },
          ]}
        >
          {/* Header Marca + Agencia */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
              <View style={styles.brandTextContainer}>
                <Text style={styles.brandName}>KAMALUSO</Text>
                <Text
                  style={[
                    styles.brandSubtitle,
                    isBw ? { color: "#000000" } : {},
                  ]}
                >
                  Papelería Sublimable
                </Text>
              </View>
            </View>

            <View style={styles.agencyCard}>
              <View style={styles.agencyCardTop}>
                <Text style={styles.agencyCardTopText}>{agencyDisplay}</Text>
              </View>
              <View style={styles.agencyCardBottom}>
                <Text style={styles.agencyCardBottomText}>{deliveryBadge}</Text>
              </View>
            </View>
          </View>

          {/* Remitente */}
          <View
            style={[
              styles.senderBox,
              isBw ? { backgroundColor: "#ffffff", borderColor: "#000000" } : {},
            ]}
          >
            <View style={styles.senderHeader}>
              <Text style={[styles.senderTitle, isBw ? { color: "#000000" } : {}]}>
                REMITENTE:
              </Text>
              {data.senderRut ? (
                <Text style={[styles.senderTitle, isBw ? { color: "#000000" } : {}]}>
                  {data.senderRut}
                </Text>
              ) : null}
            </View>
            <View style={styles.senderMainRow}>
              <Text style={styles.senderName}>
                {data.senderName || "Katherine Silva"}
              </Text>
              <Text style={styles.senderPhone}>
                Tel: {data.senderPhone || "098 615 074"}
              </Text>
            </View>
            <Text style={[styles.senderDetails, isBw ? { color: "#000000" } : {}]}>
              {senderAddress}
              {senderWebsite ? ` | ${senderWebsite}` : ""}
            </Text>
          </View>

          {/* Destinatario + Dirección */}
          <View style={styles.destinatarioBox}>
            <View>
              <View style={styles.destinatarioHeader}>
                <Text
                  style={[
                    styles.destinatarioTag,
                    isBw ? { color: "#000000" } : {},
                  ]}
                >
                  DESTINATARIO:
                </Text>
                <View style={styles.destinatarioDeptBadge}>
                  <Text style={styles.destinatarioDeptText}>
                    {data.recipientDept || "URUGUAY"}
                  </Text>
                </View>
              </View>

              <View style={styles.recipientMain}>
                <Text
                  hyphenationCallback={(w) => [w]}
                  style={[styles.recipientNameText, { fontSize: nameFontSize }]}
                >
                  {data.recipientName || "[NOMBRE O EMPRESA]"}
                </Text>

                <View style={styles.recipientPhoneRow}>
                  <Svg width={13} height={13} viewBox="0 0 24 24">
                    <Path
                      fill="#000000"
                      d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z"
                    />
                  </Svg>
                  <Text
                    style={[
                      styles.recipientPhoneText,
                      { fontSize: phoneFontSize },
                    ]}
                  >
                    TEL: {data.recipientPhone || "—"}
                  </Text>
                </View>

                <View style={styles.recipientCityRow}>
                  <Svg width={11} height={11} viewBox="0 0 24 24">
                    <Path
                      fill={isBw ? "#000000" : "#334155"}
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                    />
                  </Svg>
                  <Text
                    style={[
                      styles.recipientCityText,
                      isBw ? { color: "#000000" } : {},
                    ]}
                  >
                    {cityDept}
                  </Text>
                </View>

                {resolvedRut ? (
                  <Text
                    style={[
                      styles.rutText,
                      isBw
                        ? {
                            backgroundColor: "#ffffff",
                            borderColor: "#000000",
                            color: "#000000",
                          }
                        : {},
                    ]}
                  >
                    RUT / CI: {resolvedRut}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.recipientAddressBox}>
              <Text
                style={[
                  styles.addressSectionLabel,
                  isBw ? { color: "#000000" } : {},
                ]}
              >
                {addressLabel}
              </Text>
              <Text
                hyphenationCallback={(w) => [w]}
                style={[
                  styles.recipientAddressText,
                  { fontSize: addressFontSize },
                ]}
              >
                {cleanAddress ||
                  (deliveryType === "agencia"
                    ? "[INDICAR SUCURSAL]"
                    : "[CALLE Y N°]")}
                {cleanObs ? (
                  <Text
                    style={[
                      styles.observationsInline,
                      isBw ? { color: "#000000" } : {},
                    ]}
                  >
                    {` (${cleanObs})`}
                  </Text>
                ) : null}
              </Text>
            </View>
          </View>

          {/* Frágil */}
          <View
            style={[
              styles.fragileBox,
              isBw ? { backgroundColor: "#ffffff", borderColor: "#000000" } : {},
            ]}
          >
            <Svg width={10} height={10} viewBox="0 0 24 24">
              <Path
                fill={isBw ? "#000000" : "#b91c1c"}
                d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
              />
            </Svg>
            <Text
              hyphenationCallback={(w) => [w]}
              style={[styles.fragileText, isBw ? { color: "#000000" } : {}]}
            >
              {fragileText}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <Text
                style={[
                  styles.orderNumberLabel,
                  isBw ? { color: "#000000" } : {},
                ]}
              >
                N° de Pedido:
              </Text>
              <Text style={styles.orderNumberValue}>
                #{data.orderNumber || "KAM-000000"}
              </Text>
            </View>

            {qrUrl ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrTextContainer}>
                  <Text style={styles.qrTitle}>Tienda Web</Text>
                  <Text
                    style={[
                      styles.qrSubtitle,
                      isBw ? { color: "#000000" } : {},
                    ]}
                  >
                    Escaneá el QR
                  </Text>
                </View>
                <Image src={qrUrl} style={styles.qrImage} />
              </View>
            ) : (
              <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                {senderWebsite}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ShippingLabelPDFDocument;
