import React from "react";
type IProps = {
  addContact?: (id: string) => void;
  contact?: any;
  index?: number;
};

const ContactItem = React.memo((props: IProps) => {
  const { addContact, contact, index } = props;

  return (
    <li onClick={() => addContact(contact.id)} className={`contacts-item friends new-list`} key={index}>
      <div className='avatar'>
        <img src={contact.avatar} alt='' />
      </div>
      <div className='contacts-content'>
        <div className='contacts-info'>
          <h4 className='chat-name user_name_to'>{contact.name}</h4>
        </div>
      </div>
    </li>
  );
});

export default ContactItem;
