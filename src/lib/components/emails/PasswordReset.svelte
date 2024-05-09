<script lang="ts">
	import { BASE_URL } from '$env/static/private';
	import { Container, Head, Heading, Hr, Html, Link, Section, Text } from 'svelte-email';

	export let token: string;

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
			fontFamily,
			padding: '4rem',
			backgroundColor: '#fff',
			maxWidth: '100%',
			gap: '1.05rem'
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
		<title>Password Reset</title>
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
						<Heading as="h2" style={content.title}>Reset Password</Heading>
						<Text style={{ textAlign: 'center' }}>
							We recently received a request to reset the password for your RENZ Online Food
							Ordering account. If you did not make this request, please disregard this email.
						</Text>
						<Text style={{ textAlign: 'center' }}>
							To reset your password, please click on the button below:
						</Text>

						<Container style={{ display: 'flex', width: '100%' }}>
							<Link
								href={`${BASE_URL}/forgotPassword?token=${token}`}
								style={content.trackOrder.link}
							>
								<Text style={content.trackOrder.label}>Reset Password</Text>
							</Link>
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
		</Container>
	</Section>
</Html>
