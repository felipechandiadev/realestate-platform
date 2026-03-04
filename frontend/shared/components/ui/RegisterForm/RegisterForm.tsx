'use client';

import React, { useState } from 'react';
import { TextField } from '../TextField/TextField';
import { Button } from '../Button/Button';

interface RegisterFormProps {
	onRegister?: (data: RegisterData) => Promise<void>;
	onLogin?: () => void;
	loading?: boolean;
}

interface RegisterData {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
}

export default function RegisterForm({ onRegister, onLogin, loading = false }: RegisterFormProps) {
	const [formData, setFormData] = useState<RegisterData>({
		firstName: '',
		lastName: '',
		email: '',
		username: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (field: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({ ...prev, [field]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// Validaciones básicas
		if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
			setError('Por favor, completa todos los campos');
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Las contraseñas no coinciden');
			return;
		}

		if (formData.password.length < 6) {
			setError('La contraseña debe tener al menos 6 caracteres');
			return;
		}

		try {
			if (onRegister) {
				await onRegister(formData);
			}
		} catch (err) {
			// Log the error for debugging and keep user-friendly message
			 
			console.error(err);
			setError('Error al registrar usuario. Inténtalo de nuevo.');
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-md mx-auto space-y-4"
			data-test-id="register-form"
		>
			<h2 className="text-xl font-bold text-center mb-4">Crear cuenta</h2>

			<div className="grid grid-cols-2 gap-3">
				<TextField
					label="Nombre"
					name="firstName"
					type="text"
					value={formData.firstName}
					onChange={handleChange('firstName')}
					placeholder="Tu nombre"
					required
					data-test-id="register-firstName"
				/>
				<TextField
					label="Apellido"
					name="lastName"
					type="text"
					value={formData.lastName}
					onChange={handleChange('lastName')}
					placeholder="Tu apellido"
					required
					data-test-id="register-lastName"
				/>
			</div>

			<TextField
				label="Correo electrónico"
				name="email"
				type="email"
				value={formData.email}
				onChange={handleChange('email')}
				placeholder="tu@email.com"
				required
				data-test-id="register-email"
			/>

			<TextField
				label="Nombre de usuario"
				name="username"
				type="text"
				value={formData.username}
				onChange={handleChange('username')}
				placeholder="Nombre de usuario"
				required
				data-test-id="register-username"
			/>

			<TextField
				label="Contraseña"
				name="password"
				type={showPassword ? "text" : "password"}
				value={formData.password}
				onChange={handleChange('password')}
				placeholder="Contraseña"
				required
				data-test-id="register-password"
			/>

			<TextField
				label="Confirmar contraseña"
				name="confirmPassword"
				type={showPassword ? "text" : "password"}
				value={formData.confirmPassword}
				onChange={handleChange('confirmPassword')}
				placeholder="Repite tu contraseña"
				required
				data-test-id="register-confirmPassword"
			/>

			<div className="flex items-center">
				<input
					type="checkbox"
					id="showPassword"
					checked={showPassword}
					onChange={togglePasswordVisibility}
					className="mr-2"
				/>
				<label htmlFor="showPassword" className="text-sm text-gray-600">
					Mostrar contraseñas
				</label>
			</div>

			{error && <div className="text-red-500 text-sm text-center">{error}</div>}

			<Button type="submit" variant="primary" className="w-full" disabled={loading} data-test-id="register-submit">
				{loading ? 'Registrando...' : 'Registrarse'}
			</Button>

			{onLogin && (
				<Button type="button" variant="text" className="w-full" onClick={onLogin}>
					¿Ya tienes cuenta? Inicia sesión
				</Button>
			)}
		</form>
	);
}