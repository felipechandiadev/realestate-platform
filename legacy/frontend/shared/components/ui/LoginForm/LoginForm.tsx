'use client';

import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TextField } from '../TextField/TextField';
import { Button } from '../Button/Button';

interface LoginFormProps {
	onLogin?: (username: string, password: string) => Promise<void>;
	onRegister?: () => void;
	loading?: boolean;
}

export default function LoginForm({ onLogin, onRegister, loading = false }: LoginFormProps) {
	const router = useRouter();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!email || !password) {
			setError('Por favor, completa todos los campos');
			return;
		}

		try {
			const res = await signIn('credentials', {
				redirect: false,
				email: email,
				password: password,
			});

			if (res?.error) {
				setError('Error al iniciar sesión. Verifica tus credenciales.');
			} else if (res?.ok) {
				// Login exitoso, redirigir según el rol
				router.push('/portal');
			}
		} catch (err) {
			setError('Error al iniciar sesión. Verifica tus credenciales.');
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

		return (
					<form
							onSubmit={handleSubmit}
							className="w-full max-w-sm mx-auto rounded-lg p-6 flex flex-col gap-4 backdrop-blur-sm"
							style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 33%, rgba(255,255,255,0.4) 100%)' }}
							data-test-id="login-form"
					>
												<div className="flex flex-col items-center mb-2">
													<Logo className="w-[180px] h-[180px] mb-6" />
																<div className="mb-6 text-center">
																	<div className="text-xl font-bold text-white" data-test-id="login-app-name">DSPM-App</div>
																	<div className="text-sm opacity-70 text-white" data-test-id="login-app-version">v1.0.0-alpha.1</div>
																</div>
												</div>
				<h2 className="text-xl font-bold text-center mb-2 text-white">Iniciar sesión</h2>
			<div className="flex flex-col gap-3">
				   <TextField
					   label="Correo electrónico"
					   name="email"
					   type="email"
					   value={email}
					   onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmail(e.target.value)}
					   placeholder="tu@email.com"
					   className=""
							   data-test-id="login-email"
				   />
							<TextField
								label="Contraseña"
								name="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
								data-test-id="login-password"
								placeholder="Contraseña"
							/>
							
							
			</div>
			{error && <div className="text-red-500 text-sm text-center">{error}</div>}
			   <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading} data-test-id="login-submit">
				   {loading ? 'Ingresando...' : 'Ingresar'}
			   </Button>
			{onRegister && (
				<Button type="button" variant="text" className="w-full" onClick={onRegister}>
					¿No tienes cuenta? Regístrate
				</Button>
			)}
		</form>
	);
}
