// Copyright (c) 2023, Noori and contributors
// For license information, please see license.txt

function cal_plan_end(frm) {
	if (!frm.doc.date_of_registration || !frm.doc.validity_plan_in_days) return;
	let date_of_reg = frappe.datetime.str_to_obj(frm.doc.date_of_registration);
	let valid_till_date = frappe.datetime.add_days(date_of_reg, frm.doc.validity_plan_in_days);
	frm.set_value('membership_ends', valid_till_date);
}

function cal_lock_end(frm){
	let day_to_add_for_locker= frm.doc.locker_duration *30
	let date_of_reg = new Date(frm.doc.date_of_registration);
	let loc_avail_upto = new Date(date_of_reg + day_to_add_for_locker)
	loc_avail_upto.setDate(date_of_reg.getDate()+day_to_add_for_locker)
	frm.set_value('locker_available_till', loc_avail_upto)
}

function extra_class_total(frm){
	if(frm.doc.do_you_want_extra_classes==="Yes"){
		let total_fee = 0;
		frm.doc.extra_classes.forEach(row => {
			total_fee += row.fee || 0;
		});
		frm.set_value('extra_classes_total_fee', total_fee);
	}
}

frappe.ui.form.on('Gym Membership', {
	setup: function (frm) {
		frm.duplicate_classes = function (frm, row) {
			frm.doc.extra_classes.forEach(element => {
				if (row.class_id == '' || row.idx == element.idx) {
				}
				else {
					if (row.class_id == element.class_id) {
						row.class_id = ''
						frappe.throw(`You have already taken ${element.class_name} class at  ${element.idx}`)
						frappe.refresh_field('class_id')
					}
				}
			});
		}

		frm.calculate_extra_classes_total_fee = function () {
			let total_fee = 0;
			frm.doc.extra_classes.forEach(row => {
				total_fee += row.fee || 0;
			});
			frm.set_value('extra_classes_total_fee', total_fee);
		};
	},
	date_of_registration: cal_plan_end,
	validity_plan_in_days: cal_plan_end,
	before_save: extra_class_total,
	locker_id: cal_lock_end,
	locker_duration: cal_lock_end,
});

frappe.ui.form.on('Gym Extra Classes Child Table', {
	class_id: function(frm, cdt, cdn){
		let row = locals[cdt][cdn]
		frm.duplicate_classes(frm, row)
		frm.calculate_extra_classes_total_fee(frm)
	},
	extra_classes_remove: (frm, cdt, cdn) => {
		frm.calculate_extra_classes_total_fee(frm)
	},
});
