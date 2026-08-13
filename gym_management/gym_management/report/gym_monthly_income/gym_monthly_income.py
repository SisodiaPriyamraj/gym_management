# Copyright (c) 2023, Noori and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
	return get_coulmns(),get_data(filters)

def get_data(filters):
	conditions = ""
	values = {}
	if filters and filters.get('member_name'):
		conditions += " AND member_name = %(member_name)s"
		values['member_name'] = filters.get('member_name')
	if filters and filters.get('subscription_plan'):
		conditions += " AND subscription_plan = %(subscription_plan)s"
		values['subscription_plan'] = filters.get('subscription_plan')

	data = frappe.db.sql(f"""select name,member_name,subscription_plan,membership_fee_balance,plane_fee,master_fee,extra_classes_total_fee,locker_total_fee,total_fee,fee_paid,balance from `tabGym Registration Form` where docstatus=1 {conditions};""", values)

	return data

def get_coulmns():
	return[
		"ID:Link/Gym Registration Form :150",
		"Member Name:Data:150",
		"Subscription Plan:Data:100",
		"Membership Fee :Currency :100",
		"Plan Fee :Currency :100",
		"Master Fee Balance:Currency :100",
		"Extra Class Fee:Currency:150",
		"Locker Fee:Currency:100",
		"Total Fee:Currency:100",
		"Fee Paid:Currency:100",
		"Balance:Currency:100",
	]

