"""update models

Revision ID: 19659b1148da
Revises: 3fe0da05106f
Create Date: 2024-04-13 15:37:44.086931

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '19659b1148da'
down_revision = '3fe0da05106f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.drop_column('created_at')

    # ### end Alembic commands ###
