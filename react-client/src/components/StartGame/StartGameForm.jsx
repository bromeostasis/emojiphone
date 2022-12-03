import { useForm, useFieldArray } from "react-hook-form";

const phone = require("phone");



function StartGameForm() {
	const { register, clearErrors, control, handleSubmit, setError, formState: { errors }  } = useForm({
		
	});
	const { fields, append, remove } = useFieldArray({
		control,
		rules: {
			minLength: {
				value: 1,
				message: 'Please enter at least two players'
			}, // TODO: Constant
			required: 'Please enter at least two players',
		},
		name: "players"
	});

	const submitForm = async (data) => {
		const response = await fetch('/startGame', {
			method: 'POST',
			headers: {
		    	'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		});
		const body = await response.json();
		if (response.status !== 200) {
			setError('players.root', { type: 'custom', message: body.message }) 
		} else {
			clearErrors('players.root')
		}

	}
  
	return (
		<div>
			<form onSubmit={handleSubmit(async (data) => await submitForm(data))}>
			  <ul>
			  	<li>
			  		<PlayerInput errors={errors} register={register} placeholderPrefix='YOUR ' />
			  	</li>
			    {fields.map((item, index) => (
			      <li key={item.id}>
			      	<PlayerInput errors={errors?.players?.[index]} register={register} namePrefix={`players.${index}.`} />
			        <button type="button" onClick={() => remove(index)}>X</button>
			      </li>
			    ))}
  				{errors.players && errors.players.root && <span>{errors.players.root.message}</span>}

			  </ul>
			  <button
			    type="button"
			    onClick={() => append({ firstName: "", lastName: "", phoneNumber: null })}
			  >
			    append
			  </button>
			  <input type="submit" />
			</form>
		</div>
	)
}

function PlayerInput(props) {
	const { errors, register, namePrefix= '', placeholderPrefix = '' } = props
	return (
		<>
		    <input {...register(`${namePrefix}firstName`, {required: 'First name required'})} placeholder={`${placeholderPrefix}First Name`} />
  			{errors?.firstName && <span>{errors?.firstName.message}</span>}
		    <input {...register(`${namePrefix}lastName`)} placeholder={`${placeholderPrefix}Last Name (Optional)`}/>
		    <input {...register(`${namePrefix}phoneNumber`, {
		    	validate: v => phone(v, "USA").length !== 0 || 'Please enter a valid US phone number'
		    })} placeholder={`${placeholderPrefix}Phone Number`}/>
  			{errors?.phoneNumber && <span>{errors?.phoneNumber.message}</span>}
		</>
	)

}

export default StartGameForm;