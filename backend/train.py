import spacy
import random
from spacy.training import Example
from spacy.lookups import Lookups
import os

# Load the pre-trained spaCy model
nlp = spacy.load('en_core_web_sm')

# Ensure lookups data is available
lookups = Lookups()
lookups.add_table("lexeme_norm", {"hello": "hello", "world": "world"})
nlp.vocab.lookups = lookups

# Training data focused on Name, Phone, Email, and Address
TRAIN_DATA = [
    ("My name is Mohamed Sudais SO Sabeer Ahamed. You can contact me at mohamedsudais360@gmail.com or +65 8806 4911. I live at 123 Main St, Singapore.", 
     {"entities": [(11, 42, "NAME"), (61, 85, "EMAIL"), (90, 103, "PHONE"), (113, 132, "ADDRESS")]}),
    ("Contact: Jane Doe, Email: jane.doe@example.com, Phone: +1 234 567 8901, Address: 456 Elm St, Springfield", 
     {"entities": [(9, 17, "NAME"), (25, 43, "EMAIL"), (52, 66, "PHONE"), (76, 99, "ADDRESS")]}),
    ("Name: John Doe, Email: john.doe@example.com, Phone: (123) 456-7890, Address: 789 Oak St, Metropolis", 
     {"entities": [(6, 14, "NAME"), (22, 40, "EMAIL"), (49, 63, "PHONE"), (73, 96, "ADDRESS")]}),
    ("Reach me at mohamedsudais360@gmail.com or call +65 8806 4911. My home is at 123 Main St, Singapore.",
     {"entities": [(11, 35, "EMAIL"), (45, 58, "PHONE"), (72, 91, "ADDRESS")]}),
    ("Phone: +65 8806 4911, Email: mohamedsudais360@gmail.com, Name: Mohamed Sudais SO Sabeer Ahamed, Address: 123 Main St, Singapore", 
     {"entities": [(7, 20, "PHONE"), (28, 52, "EMAIL"), (60, 91, "NAME"), (101, 120, "ADDRESS")]}),
    ("John Smith, john.smith@example.com, (321) 654-0987, 101 First Ave, Anytown", 
     {"entities": [(0, 10, "NAME"), (12, 32, "EMAIL"), (34, 48, "PHONE"), (50, 70, "ADDRESS")]}),
    ("For more information, contact Jane Doe at janedoe123@example.com or +44 20 7946 0958. She lives at 22 Baker St, London.", 
     {"entities": [(28, 36, "NAME"), (40, 60, "EMAIL"), (64, 78, "PHONE"), (91, 108, "ADDRESS")]}),
    ("Jane Smith, Email: jane.smith@example.com, Phone: +1-800-555-5555, Address: 500 Fifth Ave, New York, NY 10018", 
     {"entities": [(0, 10, "NAME"), (18, 38, "EMAIL"), (47, 63, "PHONE"), (74, 98, "ADDRESS")]}),
    ("Ahmad Bin Ali", {"entities": [(0, 13, "NAME")]}),
    ("Fatimah Binte Ahmad", {"entities": [(0, 18, "NAME")]}),
    ("John Doe", {"entities": [(0, 8, "NAME")]}),
    ("Jane SO Smith", {"entities": [(0, 12, "NAME")]}),
    ("Mohamed", {"entities": [(0, 7, "NAME")]}),
    ("Sudais", {"entities": [(0, 6, "NAME")]}),
    ("James O'Connor, Address: 1234 University Ave, Palo Alto, CA", 
     {"entities": [(0, 15, "NAME"), (26, 54, "ADDRESS")]}),
    ("Name: Alice Johnson, Address: 5678 Market St, San Francisco, CA 94103", 
     {"entities": [(6, 19, "NAME"), (29, 64, "ADDRESS")]}),
    ("Dr. Emily Tran, Phone: 555-555-5555, Email: emily.tran@domain.com, Address: 9012 Birch St, Austin, TX 73301", 
     {"entities": [(0, 13, "NAME"), (22, 34, "PHONE"), (42, 62, "EMAIL"), (72, 100, "ADDRESS")]}),
    ("Contact info: Mark Spencer, 333-333-3333, mark.spencer@domain.com, 321 Pine Rd, Boston, MA 02110", 
     {"entities": [(13, 25, "NAME"), (27, 39, "PHONE"), (41, 63, "EMAIL"), (65, 90, "ADDRESS")]}),
    ("Reach out to Lisa Brown at lisa.brown@domain.com or (987) 654-3210. Her address is 876 Willow Dr, Seattle, WA.", 
     {"entities": [(15, 25, "NAME"), (29, 49, "EMAIL"), (53, 66, "PHONE"), (80, 103, "ADDRESS")]}),
]

# Fine-tune the model
def fine_tune_model(train_data, iterations):
    # Add the new entity label to the model
    if 'ner' not in nlp.pipe_names:
        ner = nlp.create_pipe('ner')
        nlp.add_pipe(ner, last=True)
    else:
        ner = nlp.get_pipe('ner')

    for _, annotations in train_data:
        for ent in annotations.get('entities'):
            ner.add_label(ent[2])

    # Disable other pipes during training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != 'ner']
    with nlp.disable_pipes(*other_pipes):
        optimizer = nlp.begin_training()
        for itn in range(iterations):
            random.shuffle(train_data)
            losses = {}
            for text, annotations in train_data:
                doc = nlp.make_doc(text)
                example = Example.from_dict(doc, annotations)
                nlp.update([example], drop=0.35, sgd=optimizer, losses=losses)
            print(f"Iteration {itn}, Losses: {losses}")

# Fine-tune the model with the training data
fine_tune_model(TRAIN_DATA, 20)

# Save the fine-tuned model
nlp.to_disk("custom_ner_model")

# Test the fine-tuned model
test_text = "My name is Mohamed Sudais SO Sabeer Ahamed. You can contact me at mohamedsudais360@gmail.com or +65 8806 4911. I live at 123 Example Street, Singapore 123456."
doc = nlp(test_text)
for ent in doc.ents:
    print(ent.text, ent.start_char, ent.end_char, ent.label_)
