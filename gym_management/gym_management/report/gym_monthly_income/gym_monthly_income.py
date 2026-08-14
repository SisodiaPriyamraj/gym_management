# Copyright (c) 2023, Noori and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
	return get_coulmns(),get_data(filters)

def get_data(filters):
	conditions = ""
	values = {}
	if filters and filters.get('full_name'):
		conditions += " AND full_name = %(full_name)s"
		values['full_name'] = filters.get('full_name')
	if filters and filters.get('subscription_plan'):
		conditions += " AND subscription_plan = %(subscription_plan)s"
		values['subscription_plan'] = filters.get('subscription_plan')

	data = frappe.db.sql(f"""select name,full_name,subscription_plan,total_amount,master_fee,extra_classes_total_fee,locker_total_fee,amount_paid,balance from `tabGym Membership` where docstatus=1 {conditions};""", values)

	return data

def get_coulmns():
	return[
		"ID:Link/Gym Membership:150",
		"Member Name:Data:150",
		"Subscription Plan:Data:100",
		"Total Amount:Currency:100",
		"Master Fee:Currency :100",
		"Extra Class Fee:Currency:150",
		"Locker Fee:Currency:100",
		"Amount Paid:Currency:100",
		"Balance:Currency:100",
	]

