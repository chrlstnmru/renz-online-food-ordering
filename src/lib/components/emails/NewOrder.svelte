<script lang="ts">
	import { formatter } from '$lib/utils/helpers';
	import { Container, Head, Heading, Hr, Html, Link, Section, Text } from 'svelte-email';

	export let email: string;
	export let orderId: string;
	export let orderDate: string;
	export let shippingAddress: string;
	export let total: number;
	export let list: { name: string; quantity: number; price: number }[];

	const fontFamily = '"Inter", sans-serif';
	const color = 'hsl(35, 79%, 53%)';

	const main = {
		maxWidth: '600px',
		width: '100%',
		margin: '0 auto',
		boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
		borderRadius: '0.25rem',
		overflow: 'hidden'
	};
	const header = {
		title: {
			fontFamily,
			fontWeight: 900,
			fontSize: '1.875rem !important',
			margin: 0,
			color
		},
		subtitle: {
			fontFamily,
			color,
			margin: 0,
			fontWeight: 400,
			fontSize: '1rem !important'
		},
		self: {
			padding: '1rem',
			backgroundColor: '#292623',
			maxWidth: '100%',
			textAlign: 'center'
		}
	};
	const content = {
		title: {
			fontFamily,
			textAlign: 'center',
			fontSize: '2rem',
			margin: 0
		},
		trackOrder: {
			link: {
				display: 'inline-flex',
				maxWidth: 'max-content',
				margin: '0 auto',
				textDecoration: 'none'
			},
			label: {
				fontFamily,
				color: '#fff',
				textAlign: 'center',
				fontWeight: 500,
				fontSize: '1.05rem',
				margin: 0,
				backgroundColor: color,
				borderRadius: '0.25rem',
				padding: '0.9rem 1.15rem '
			}
		},
		self: {
			padding: '4rem',
			backgroundColor: '#fff',
			maxWidth: '100%',
			gap: '1.05rem'
		}
	};
	const summary = {
		child: {
			margin: '0 auto'
		},
		title: {
			fontFamily,
			margin: 0,
			fontSize: '0.95rem',
			textTransform: 'uppercase',
			fontWeight: 700
		},
		text: {
			fontFamily,
			margin: 0,
			display: 'grid'
		},
		self: {
			display: 'flex'
		}
	};
	const items = {
		self: { fontFamily, display: 'flex', width: '100%' },
		row: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr'
		},
		tableHead: {
			fontFamily,
			margin: '0 0 0.25rem 0',
			fontSize: '0.95rem',
			textTransform: 'uppercase',
			fontWeight: 700
		},
		tableEntryItem: {
			margin: '0 0.25rem'
		},
		tableEntry: {
			fontFamily,
			display: 'flex',
			margin: 0
		}
	};
</script>

<Html>
	<Head>
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
		<link
			href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
			rel="stylesheet"
		/>
		<style>
			body {
				background-color: #f9fafb;
			}
		</style>
		<title>Test Email</title>
	</Head>

	<Section>
		<Container style={{ display: 'flex', backgroundColor: '#f9fafb', maxWidth: '100%' }}>
			<Container style={main}>
				<Container style={header.self}>
					<Heading as="h1" style={header.title}>RENZ</Heading>
					<Text style={header.subtitle}>Online Food Ordering</Text>
				</Container>

				<Container style={content.self}>
					<Container>
						<Heading as="h2" style={content.title}>Your order has been placed</Heading>
						<Container style={{ display: 'flex', width: '100%' }}>
							<Link
								href={`https://renz-online-food-ordering.vercel.app/orders?email=${email}&orderId=${orderId}`}
								style={content.trackOrder.link}
							>
								<Text style={content.trackOrder.label}>Track Order</Text>
							</Link>
						</Container>
					</Container>

					<Hr style={{ margin: '1.5rem 0' }} />

					<Container style={summary.self}>
						<Container style={summary.child}>
							<Heading as="h3" style={summary.title}>Summary</Heading>
							<Text style={summary.text}>
								<span style="font-weight: 600;">Order ID:</span>
								{orderId}
							</Text>
							<Text style={summary.text}>
								<span style="font-weight: 600;">Order Date:</span>
								{orderDate}
							</Text>
						</Container>
						<Container style={summary.child}>
							<Heading as="h3" style={summary.title}>Shipping Address</Heading>
							<Text style={{ ...summary.text, display: 'block' }}>{shippingAddress}</Text>
						</Container>
					</Container>

					<Hr style={{ margin: '1.5rem 0' }} />

					<Container style={items.self}>
						<Container style={{ margin: 'auto', width: '300px' }}>
							<Heading as="h2" style={items.tableHead}>Items</Heading>
							{#each list as item}
								<Container style={items.tableEntry}>
									<Text style={items.tableEntryItem}>{item.quantity}x</Text>
									<Text style={items.tableEntryItem}>{item.name}</Text>
									<Text style={{ ...items.tableEntryItem, marginLeft: 'auto' }}>
										{formatter.format(item.price)}
									</Text>
								</Container>
							{/each}
							<Hr style={{ margin: '0.5rem 0', borderColor: 'black' }} />
							<Text style={{ ...items.tableEntryItem, width: '100%', display: 'flex' }}>
								<span style="font-weight: 600">Total</span>
								<span style="margin-left: auto">{formatter.format(total)}</span>
							</Text>
						</Container>
					</Container>

					<Hr style={{ margin: '1.5rem 0' }} />

					<Container style={{ fontSize: '0.5rem', maxWidth: '100%', opacity: 0.8 }}>
						<Text style={{ textAlign: 'center' }}>
							If you encountered any issues during the process or have any questions about our
							service, feel free to reach us at <a href="mailto:renzpancitmalabon@gmail.com"
								>renzpancitmalabon@gmail.com</a
							>
							or contact us on <a href="tel:+639555027941">09555027941</a>.
						</Text>
					</Container>
				</Container>
			</Container>
		</Container>
	</Section>
</Html>
