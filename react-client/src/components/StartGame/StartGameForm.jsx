import { useForm, useFieldArray, Controller } from "react-hook-form";

const phone = require("phone");



function StartGameForm() {
	const { register, control, handleSubmit, reset, trigger, setError } = useForm({
		
	});
	const { fields, append, remove } = useFieldArray({
		control,
		rules: {
			minLength: 4 // TODO: Constant
		},
		name: "players"
	});

	const submitForm = async (data) => {
		console.log(data)
		const response = await fetch('/startGame', {
			method: 'POST',
			headers: {
		    	'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		});
		const body = await response.json();

		if (response.status !== 200) {
		  throw Error(body.message) 
		}
		console.log('bodys back', body)

	}
  
	return (
		<div>
			<form onSubmit={handleSubmit(async (data) => await submitForm(data))}>
			  <ul>
			  	<li>
			  		<PlayerInput register={register} namePrefix='user' placeholderPrefix='YOUR ' />
			  	</li>
			    {fields.map((item, index) => (
			      <li key={item.id}>
			      	<PlayerInput register={register} namePrefix={`players.${index}.`} />
			        {/*<Controller
			          render={({ field }) => <input {...field} />}
			          name={`players.${index}.lastName`}
			          control={control}
			        />*/}
			        <button type="button" onClick={() => remove(index)}>X</button>
			      </li>
			    ))}
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
	const { register, namePrefix, placeholderPrefix = '' } = props
	return (
		<>
		    <input {...register(`${namePrefix}FirstName`, {required: true})} placeholder={`${placeholderPrefix}First Name`} />
		    <input {...register(`${namePrefix}LastName`)} placeholder={`${placeholderPrefix}Last Name (Optional)`}/>
		    <input {...register(`${namePrefix}PhoneNumber`, {
		    	validate: v => phone(v, "USA").length !== 0
		    })} placeholder={`${placeholderPrefix}Phone Number`}/>
		</>
	)

}

export default StartGameForm;