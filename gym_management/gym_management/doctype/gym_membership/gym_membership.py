# Copyright (c) 2023, Noori and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import add_days, date_diff, nowdate, getdate
import sys
sys.path.append('/Users/macbook/anwar-frappe-bench/apps/gym_management/p_function.py')
import p_function

class GymMembership(Document):
	def before_save(self):
		p_function.membership_amount(self)
		p_function.locker(self)
		self.calculate_membership_ends()

	def on_submit(self):
		sync_member_subscription_status(self.gym_member_id)

	def on_cancel(self):
		sync_member_subscription_status(self.gym_member_id)

	def calculate_membership_ends(self):
		if not (self.date_of_registration and self.validity_plan_in_days):
			return

		remaining_days = 0
		if self.entry_type == "Renew" and self.gym_member_id:
			previous = frappe.get_all(
				"Gym Membership",
				filters={
					"gym_member_id": self.gym_member_id,
					"docstatus": 1,
					"name": ["!=", self.name or ""],
				},
				fields=["membership_ends"],
				order_by="membership_ends desc",
				limit=1,
			)
			if previous and previous[0].membership_ends:
				days_left_on_old_plan = date_diff(previous[0].membership_ends, nowdate())
				if days_left_on_old_plan >= 0:
					# Old plan's end date is already paid for, so the new plan
					# starts the day after it instead of overlapping with it.
					remaining_days = days_left_on_old_plan + 1

		total_days = remaining_days + self.validity_plan_in_days
		self.membership_ends = add_days(self.date_of_registration, total_days)


def sync_member_subscription_status(gym_member_id):
	if not gym_member_id:
		return

	latest = frappe.get_all(
		"Gym Membership",
		filters={"gym_member_id": gym_member_id, "docstatus": 1},
		fields=["date_of_registration", "membership_ends"],
		order_by="membership_ends desc",
		limit=1,
	)

	if latest and latest[0].membership_ends:
		status = "Active" if getdate(latest[0].membership_ends) >= getdate(nowdate()) else "Inactive"
		frappe.db.set_value("Gym Members", gym_member_id, {
			"subscription_status": status,
			"subscription_start_date": latest[0].date_of_registration,
			"subscription_end_date": latest[0].membership_ends,
		})
	else:
		frappe.db.set_value("Gym Members", gym_member_id, {
			"subscription_status": "Inactive",
			"subscription_start_date": None,
			"subscription_end_date": None,
		})

	latest_weight_entry = frappe.get_all(
		"Gym Membership",
		filters={"gym_member_id": gym_member_id, "docstatus": 1},
		fields=["weight"],
		order_by="creation desc",
		limit=1,
	)
	frappe.db.set_value(
		"Gym Members",
		gym_member_id,
		"current_weight",
		latest_weight_entry[0].weight if latest_weight_entry else 0,
	)
			
	

