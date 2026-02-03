// Synthetic data for testing - this simulates the uploaded CSV
export const syntheticTestData = [
  { id: 1, customer_id: "CUST001", name: "Alice Johnson", email: "alice@example.com", age: 28, city: "New York", purchase_amount: 1250.50, registration_date: "2023-01-15", status: "Active", country: "USA", phone: "+1-555-0101", membership_tier: "Gold" },
  { id: 2, customer_id: "CUST002", name: "Bob Smith", email: "bob@example.com", age: 35, city: "Los Angeles", purchase_amount: 890.25, registration_date: "2023-02-20", status: "Active", country: "USA", phone: "+1-555-0102", membership_tier: "Silver" },
  { id: 3, customer_id: "CUST003", name: "Carol Williams", email: "carol@example.com", age: null, city: "Chicago", purchase_amount: 2100.00, registration_date: "2023-03-10", status: "Inactive", country: "USA", phone: "+1-555-0103", membership_tier: "Platinum" },
  { id: 4, customer_id: "CUST004", name: "David Brown", email: "david@example.com", age: 42, city: "Houston", purchase_amount: 567.80, registration_date: "2023-04-05", status: "Active", country: "USA", phone: null, membership_tier: "Bronze" },
  { id: 5, customer_id: "CUST005", name: "Eva Martinez", email: null, age: 31, city: "Phoenix", purchase_amount: 1890.45, registration_date: "2023-05-12", status: "Active", country: "USA", phone: "+1-555-0105", membership_tier: "Gold" },
  { id: 6, customer_id: "CUST006", name: "Frank Garcia", email: "frank@example.com", age: 29, city: "Philadelphia", purchase_amount: null, registration_date: "2023-06-18", status: "Pending", country: "USA", phone: "+1-555-0106", membership_tier: "Silver" },
  { id: 7, customer_id: "CUST007", name: "Grace Lee", email: "grace@example.com", age: 38, city: "San Antonio", purchase_amount: 3200.00, registration_date: "2023-07-22", status: "Active", country: "USA", phone: "+1-555-0107", membership_tier: "Platinum" },
  { id: 8, customer_id: "CUST008", name: "Henry Wilson", email: "henry@example.com", age: 45, city: "San Diego", purchase_amount: 780.90, registration_date: null, status: "Active", country: "USA", phone: "+1-555-0108", membership_tier: "Gold" },
  { id: 9, customer_id: "CUST009", name: null, email: "unknown@example.com", age: 33, city: "Dallas", purchase_amount: 1450.25, registration_date: "2023-09-08", status: "Active", country: "USA", phone: "+1-555-0109", membership_tier: "Silver" },
  { id: 10, customer_id: "CUST010", name: "Ivy Thompson", email: "ivy@example.com", age: 27, city: null, purchase_amount: 2890.00, registration_date: "2023-10-14", status: "Active", country: "USA", phone: "+1-555-0110", membership_tier: "Platinum" },
  { id: 11, customer_id: "CUST011", name: "Jack Anderson", email: "jack@example.com", age: 52, city: "San Jose", purchase_amount: 450.60, registration_date: "2023-11-20", status: "Inactive", country: "USA", phone: "+1-555-0111", membership_tier: "Bronze" },
  { id: 12, customer_id: "CUST012", name: "Karen Davis", email: "karen@example.com", age: 36, city: "Austin", purchase_amount: 1675.35, registration_date: "2023-12-01", status: "Active", country: null, phone: "+1-555-0112", membership_tier: "Gold" },
];

// Data Reliability Check - exactly 12 records as specified
export const dataReliabilityCheckData = [
  { column_name: "id", data_type: "Integer", null_check_eligibility: "Yes", format_check: "Numeric", completeness: "100%", accuracy: "100%", overall_score: "100%" },
  { column_name: "customer_id", data_type: "String", null_check_eligibility: "Yes", format_check: "String", completeness: "100%", accuracy: "100%", overall_score: "100%" },
  { column_name: "name", data_type: "String", null_check_eligibility: "No", format_check: "String", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "email", data_type: "String", null_check_eligibility: "Yes", format_check: "Email", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "age", data_type: "Integer", null_check_eligibility: "Yes", format_check: "Numeric", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "city", data_type: "String", null_check_eligibility: "Yes", format_check: "String", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "purchase_amount", data_type: "Decimal", null_check_eligibility: "Yes", format_check: "Numeric", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "registration_date", data_type: "Date", null_check_eligibility: "No", format_check: "Datetime", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "status", data_type: "String", null_check_eligibility: "No", format_check: "String", completeness: "100%", accuracy: "100%", overall_score: "100%" },
  { column_name: "country", data_type: "String", null_check_eligibility: "Yes", format_check: "String", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "phone", data_type: "String", null_check_eligibility: "Yes", format_check: "Phone", completeness: "91.67%", accuracy: "100%", overall_score: "95.83%" },
  { column_name: "membership_tier", data_type: "String", null_check_eligibility: "Yes", format_check: "String", completeness: "100%", accuracy: "100%", overall_score: "100%" },
];
