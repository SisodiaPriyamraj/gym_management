import frappe
def execute(filters=None):
	return get_coulmns(),get_data(filters)
def get_data(filters):
	conditions = ""
	values = {}
	if filters and filters.get('master_id'):
		conditions += " AND master_id = %(master_id)s"
		values['master_id'] = filters.get('master_id')
	data = frappe.db.sql(f"""select name,full_name,subscription_plan,master_name, master_fee,total_amount,amount_paid,balance from `tabGym Membership` where docstatus=1 {conditions} and do_you_want_personal_trainer="Yes";""", values)
	return data

def get_coulmns():
	return[
		"ID:Link/Gym Membership:150",
		"Member Name:Data:150",
		"Subscription Plan:Data:150",
		"Master Name:Data:150",
		"Master Fee:Currency :150",
		"Total Amount:Currency:150",
		"Amount Paid:Currency:150",
		"Balance:Currency:150",
	]

