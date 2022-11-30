import { useForm, useFieldArray, Controller } from "react-hook-form";

const phone = require("phone");



function StartGameForm() {
	const { register, control, handleSubmit, reset, trigger, setError } = useForm({
		
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "players"
	});
  
	return (
		<div>
			<form onSubmit={handleSubmit(data => console.log(data))}>
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