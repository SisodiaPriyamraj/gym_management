// Copyright (c) 2023, Noori and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gym Members', {
	refresh: function (frm) {
		if (frm.is_new()) return;
		render_membership_history(frm);
	},
});

function render_membership_history(frm) {
	frappe.db.get_list('Gym Membership', {
		filters: { gym_member_id: frm.doc.name },
		fields: ['name', 'docstatus', 'creation', 'date_of_registration', 'membership_ends', 'amended_from', 'fee_paid', 'balance'],
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

		let rows = records.map((r) => {
			let status = status_map[r.docstatus] || { label: 'Unknown', color: 'gray' };
			let event = r.amended_from
				? `Amended from <a href="/app/gym-membership/${r.amended_from}">${r.amended_from}</a>`
				: 'New Membership';
			return `
				<tr>
					<td><a href="/app/gym-membership/${r.name}">${r.name}</a></td>
					<td><span class="indicator-pill ${status.color}">${status.label}</span></td>
					<td>${event}</td>
					<td>${frappe.datetime.str_to_user(r.creation)}</td>
					<td>${r.date_of_registration || ''}</td>
					<td>${r.membership_ends || ''}</td>
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
							<th>History</th>
							<th>Taken On</th>
							<th>Starts</th>
							<th>Ends</th>
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
