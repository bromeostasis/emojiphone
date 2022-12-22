import { useForm, useFieldArray } from "react-hook-form";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

const phone = require("phone");

const emptyPlayer = {firstName: '', lastName: '', phoneNumber: ''}

const MINIMUM_OTHER_PLAYERS = {text: 'four', number: 4} // TODO: Pull constant to shared between BE/FE
const MINIMUM_OTHER_PLAYERS_MESSAGE = `Please add at least ${MINIMUM_OTHER_PLAYERS.text} other players`

const defaultValues = {
	...emptyPlayer,
	players: [],
}
for (let i = 0; i < MINIMUM_OTHER_PLAYERS.number; i++) {
	defaultValues.players.push(emptyPlayer);
}

function StartGameForm() {
	const { register, clearErrors, control, handleSubmit, setError, formState: { errors }  } = useForm({
		defaultValues
	});
	const { fields, append, remove } = useFieldArray({
		control,
		rules: {
			minLength: {
				value: MINIMUM_OTHER_PLAYERS.number,
				message: MINIMUM_OTHER_PLAYERS_MESSAGE
			},
			required: MINIMUM_OTHER_PLAYERS_MESSAGE,
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
		<Row className='pt-3'>
			<Col>
				<Form autocomplete='off' noValidate onSubmit={handleSubmit(async (data) => await submitForm(data))}>
					<Row className='gameForm pt-4 pb-4'>
					  	<Row className='pt-1 yourInfo pb-3'>
					  		<Row><p>Your info:</p></Row>
					  		<PlayerInput errors={errors} register={register} />
					  	</Row>
					  	<Row><p className='mb-0'>Your friends' info:</p></Row>
					    {fields.map((item, index) => (
					      <Row className='pt-3' key={item.id}>
					      	<PlayerInput errors={errors?.players?.[index]} register={register} namePrefix={`players.${index}.`} />
					      	<Col xs={1} className='d-flex justify-content-center'>
						        <Button 
						        	variant='link'
						        	type="button"
						        	onClick={() => remove(index)}
						        	className='ps-0 pe-4 removePlayerLink'
						        >
						        	⛔️
						        </Button>
					      	</Col>
					      </Row>
					    ))}
		  				{errors.players && errors.players.root && <span>{errors.players.root.message}</span>}
		  				<Row><Col xs={2}>
							<Button
								variant='link'
								onClick={() => append({ firstName: "", lastName: "", phoneNumber: null })}
								className='ps-0'
							>
								add more ➕
							</Button>
						</Col></Row>
					</Row>
					<Row className='pt-3'>
						<Col xs={{span: 6, offset: 3}} className='d-flex justify-content-center'>
					  		<Button type="submit" > ⚡️ let's go ⚡️ </Button>
					  	</Col>
					</Row>
				</Form>
			</Col>
		</Row>
	)
}

function PlayerInput(props) {
	const { errors, register, namePrefix= '', placeholderPrefix = '' } = props
	const { Group, Control } = Form
	const { Feedback } = Control
	return (
		<>
			<Group as={Col} xs={4} controlId={`${namePrefix}firstName`} className='pe-0'>
			    <Control 
			    	{...register(`${namePrefix}firstName`, {required: 'First name required'})}
			    	placeholder={`${placeholderPrefix}First Name*`} 
			    	isInvalid={!!errors?.firstName}
			    />
	  			<Feedback type='invalid'>{errors?.firstName?.message}</Feedback>
			</Group>
			<Group as={Col} xs={4} controlId={`${namePrefix}lastName`} className='pe-0 ps-0'>
		    	<Control {...register(`${namePrefix}lastName`)} placeholder={`${placeholderPrefix}Last Name`}/>
			</Group>
			<Group as={Col} xs={3} controlId={`${namePrefix}phoneNumber`} className='ps-0'>
			    <Control
			    	{...register(`${namePrefix}phoneNumber`, {
			    		validate: v => phone(v, "USA").length !== 0 || 'Invalid US phone number'
			    	})} 
			    	placeholder={`${placeholderPrefix}Phone*`}
			    	isInvalid={!!errors?.phoneNumber}
			    	type='tel'
			    />
	  			<Feedback type='invalid'>{errors?.phoneNumber?.message}</Feedback>
	  		</Group>
		</>
	)
}

export default StartGameForm;