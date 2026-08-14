import frappe
from frappe import _

@frappe.whitelist()
def get_member_data():
    member = frappe.get_last_doc('Gym Membership')
    member_name = member.get('full_name')
    subscription_plan = member.get('subscription_plan')
    master_phone_number = None
    if member.do_you_want_personal_trainer=='Yes':
        master_name = member.get('master_name')
        master_phone_number = member.get('master_phone_number')
    else:
        master_name='No Trainer'
    return {
        'subscription_plan':subscription_plan,
        'master_name': master_name,
        'master_phone_number':master_phone_number,
        'member_name':member_name,
    }
    
