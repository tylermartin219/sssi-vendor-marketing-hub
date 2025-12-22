import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define styles for the invoice PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#be0909",
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoColumn: {
    width: "48%",
  },
  label: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottom: "1 solid #ccc",
    paddingBottom: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottom: "1 solid #ccc",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #eee",
  },
  colDescription: {
    width: "40%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "right",
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
  },
  colTotal: {
    width: "25%",
    textAlign: "right",
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "40%",
    marginBottom: 5,
  },
  totalLabel: {
    width: "60%",
    textAlign: "right",
    paddingRight: 10,
  },
  totalValue: {
    width: "40%",
    textAlign: "right",
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    borderTop: "2 solid #be0909",
    paddingTop: 5,
    marginTop: 5,
  },
  notes: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1 solid #ddd",
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  user: {
    name: string | null;
    email: string;
    company: string | null;
  };
  billingAddress: string;
  items: InvoiceItem[];
  total: number;
  notes?: string | null;
}

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  const billingAddress = JSON.parse(invoice.billingAddress || "{}");
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.invoiceInfo}>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Invoice Number:</Text>
              <Text style={styles.value}>{invoice.invoiceNumber}</Text>
              <Text style={styles.label}>Invoice Date:</Text>
              <Text style={styles.value}>{formatDate(invoice.invoiceDate)}</Text>
              {invoice.dueDate && (
                <>
                  <Text style={styles.label}>Due Date:</Text>
                  <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
                </>
              )}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Bill To:</Text>
              <Text style={styles.value}>
                {invoice.user.company || invoice.user.name || invoice.user.email}
              </Text>
              {invoice.user.name && invoice.user.company && (
                <Text style={styles.value}>{invoice.user.name}</Text>
              )}
              {billingAddress.street && (
                <Text style={styles.value}>{billingAddress.street}</Text>
              )}
              {billingAddress.city && (
                <Text style={styles.value}>
                  {billingAddress.city}
                  {billingAddress.state && `, ${billingAddress.state}`}
                  {billingAddress.zip && ` ${billingAddress.zip}`}
                </Text>
              )}
              {billingAddress.country && (
                <Text style={styles.value}>{billingAddress.country}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQuantity}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {invoice.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDescription}>
                  {item.description}
                  {item.notes && `\n${item.notes}`}
                </Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

