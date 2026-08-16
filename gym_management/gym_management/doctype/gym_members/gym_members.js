// Copyright (c) 2023, Noori and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gym Members', {
	refresh: function (frm) {
		if (frm.is_new()) return;
		render_membership_history(frm);
	},
});

function format_ddmmyyyy(date_str) {
	if (!date_str) return '';
	let d = frappe.datetime.str_to_obj(date_str);
	let dd = String(d.getDate()).padStart(2, '0');
	let mm = String(d.getMonth() + 1).padStart(2, '0');
	return `${dd}/${mm}/${d.getFullYear()}`;
}

function render_membership_history(frm) {
	frappe.db.get_list('Gym Membership', {
		filters: { gym_member_id: frm.doc.name },
		fields: ['name', 'docstatus', 'creation', 'entry_type', 'date_of_registration', 'membership_ends', 'amended_from', 'fee_paid', 'balance', 'weight'],
		order_by: 'creation asc',
		limit: 0,
	}).then((records) => {
		let wrapper = frm.fields_dict.membership_history_html.$wrapper;

		if (!records.length) {
			wrapper.html('<p class="text-muted">No membership history yet.</p>');
			return;
		}

		let status_map = {
			0: { label: 'Draft', color: 'gray' },
			1: { label: 'Active', color: 'green' },
			2: { label: 'Cancelled', color: 'red' },
		};

		let rows = records.map((r, i) => {
			let status = status_map[r.docstatus] || { label: 'Unknown', color: 'gray' };
			let type_color = r.entry_type === 'Renew' ? 'blue' : 'gray';
			let weight_change = '';
			if (i > 0 && records[i - 1].weight && r.weight) {
				let diff = r.weight - records[i - 1].weight;
				if (diff !== 0) {
					let color = diff < 0 ? 'green' : 'red';
					let sign = diff > 0 ? '+' : '';
					weight_change = ` <span class="text-${color}">(${sign}${diff.toFixed(1)})</span>`;
				}
			}
			return `
				<tr>
					<td><a href="/app/gym-membership/${r.name}">${r.name}</a></td>
					<td><span class="indicator-pill ${status.color}">${status.label}</span></td>
					<td><span class="indicator-pill ${type_color}">${r.entry_type || ''}</span></td>
					<td>${frappe.datetime.str_to_user(r.creation)}</td>
					<td>${format_ddmmyyyy(r.date_of_registration)}</td>
					<td>${format_ddmmyyyy(r.membership_ends)}</td>
					<td>${r.weight ? r.weight + ' kg' : ''}${weight_change}</td>
					<td>${r.fee_paid || ''}</td>
					<td>${format_currency(r.balance || 0)}</td>
				</tr>`;
		}).join('');

		wrapper.html(`
			<div class="table-responsive">
				<table class="table table-bordered">
					<thead>
						<tr>
							<th>Membership</th>
							<th>Status</th>
							<th>Type</th>
							<th>Taken On</th>
							<th>Starts</th>
							<th>Ends</th>
							<th>Weight</th>
							<th>Fee Status</th>
							<th>Balance</th>
						</tr>
					</thead>
					<tbody>${rows}</tbody>
				</table>
			</div>
		`);
	});
}
